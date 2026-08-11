#!/usr/bin/env python3
"""PreToolUse(Bash) hook — enforce the commit rules from CLAUDE.md.

Fires on every Bash call, does nothing unless the command runs `git commit`.
At that point it checks, in order:

  1. No hook-bypassing flags          (CLAUDE.md section 6)
  2. Not committing to main           (CLAUDE.md section 6)
  3. `npm run build` passes clean     (CLAUDE.md section 7)

The build runs last because it is the expensive one — there is no point
compiling the site to then refuse the commit over a branch name.

Exit 0 allows the call. Exit 2 blocks it and shows stderr to Claude.
"""

import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _commitcmd import allow, block, commit_segments, read_tool_input  # noqa: E402

PROTECTED_BRANCHES = {"main", "master"}

# Flags that skip a git hook or its signing step. `-n` is git commit's short
# form of --no-verify; it is only read this way inside a commit segment, so a
# `grep -n` elsewhere in a compound command is unaffected.
BYPASS_FLAGS = re.compile(r"(?:^|\s)(--no-verify|--no-gpg-sign|--no-post-rewrite|-n)(?=\s|$)")

BUILD_TIMEOUT_SECONDS = 240


def git(*args):
    """Run a git command in the project dir. Returns (ok, output)."""
    try:
        result = subprocess.run(
            ["git", *args],
            capture_output=True,
            text=True,
            timeout=30,
            errors="replace",
        )
    except (OSError, subprocess.SubprocessError) as exc:
        return False, str(exc)
    if result.returncode != 0:
        return False, (result.stderr or result.stdout).strip()
    return True, result.stdout.strip()


def current_branch():
    """Branch name, or None if detached or unreadable.

    symbolic-ref is used rather than rev-parse so that a branch with no
    commits yet still reports its name instead of "HEAD".
    """
    ok, name = git("symbolic-ref", "--short", "HEAD")
    return name if ok and name else None


def has_build_script():
    """True if package.json defines a build script."""
    try:
        with open("package.json", encoding="utf-8") as handle:
            package = json.load(handle)
    except (OSError, ValueError):
        return False
    scripts = package.get("scripts")
    return isinstance(scripts, dict) and "build" in scripts


def tail(text, lines=40):
    kept = text.strip().splitlines()[-lines:]
    return "\n".join(f"  {line}" for line in kept)


def run_build():
    """Run npm run build. Returns None on success, else a failure message."""
    if not os.path.isfile("package.json"):
        return None
    if not has_build_script():
        return None
    if not os.path.isdir("node_modules"):
        return (
            "node_modules is missing, so the build gate cannot run.\n"
            "  Run `npm install` first, then commit."
        )

    npm = "npm.cmd" if os.name == "nt" else "npm"
    try:
        result = subprocess.run(
            [npm, "run", "build"],
            capture_output=True,
            text=True,
            timeout=BUILD_TIMEOUT_SECONDS,
            errors="replace",
        )
    except subprocess.TimeoutExpired:
        return (
            f"`npm run build` did not finish within {BUILD_TIMEOUT_SECONDS}s "
            "and was killed.\n"
            "  The commit is blocked because the build is unverified."
        )
    except OSError as exc:
        return f"`npm run build` could not be started: {exc}"

    if result.returncode != 0:
        output = tail((result.stdout or "") + "\n" + (result.stderr or ""))
        return f"`npm run build` failed (exit {result.returncode}):\n{output}"
    return None


def main():
    command = read_tool_input()
    if command is None:
        allow()

    segments = commit_segments(command)
    if not segments:
        allow()

    for segment in segments:
        bypass = BYPASS_FLAGS.search(segment)
        if bypass:
            block(
                f"Blocked: `{bypass.group(1)}` skips a git hook.\n"
                "CLAUDE.md section 6 forbids bypassing hooks. If a hook is "
                "failing, fix the underlying problem instead."
            )

    branch = current_branch()
    if branch in PROTECTED_BRANCHES:
        block(
            f"Blocked: this would commit directly to {branch}.\n"
            "CLAUDE.md section 6 requires a branch named [type]/[short-description].\n"
            "  Run `git switch -c feat/<short-description>` and commit there."
        )

    failure = run_build()
    if failure:
        block(
            f"Blocked: the build gate did not pass.\n{failure}\n\n"
            "CLAUDE.md section 7 requires a clean `npm run build` before a commit."
        )

    allow()


if __name__ == "__main__":
    main()
