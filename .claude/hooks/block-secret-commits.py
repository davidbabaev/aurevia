#!/usr/bin/env python3
"""PreToolUse(Bash) hook — stop a credential from reaching a commit.

Fires on every Bash call, does nothing unless the command runs `git commit`.
At that point it reads the staged diff and refuses the commit if an added
line carries something that looks like a live credential.

Fails closed: if the staged diff cannot be read, the commit is blocked
rather than waved through, because an unreadable diff is an unscanned diff.

Exit 0 allows the call. Exit 2 blocks it and shows stderr to Claude.
"""

import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _commitcmd import allow, block, commit_segments, read_tool_input  # noqa: E402

# High-precision vendor formats. Each of these is a specific issued-token
# shape, so a hit is worth stopping the commit over.
VENDOR_PATTERNS = [
    ("AWS access key id", r"\bAKIA[0-9A-Z]{16}\b"),
    ("AWS secret access key", r"(?i)\baws_secret_access_key\s*[:=]\s*\S{40}"),
    ("private key block", r"-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----"),
    ("GitHub token", r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b"),
    ("GitHub fine-grained PAT", r"\bgithub_pat_[A-Za-z0-9_]{22,}\b"),
    ("Slack token", r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"),
    ("Stripe live key", r"\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b"),
    ("Google API key", r"\bAIza[0-9A-Za-z_\-]{35}\b"),
    ("Anthropic API key", r"\bsk-ant-[A-Za-z0-9_\-]{20,}\b"),
    ("OpenAI API key", r"\bsk-(?:proj-)?[A-Za-z0-9_\-]{32,}\b"),
    ("npm token", r"\bnpm_[A-Za-z0-9]{36}\b"),
    ("SendGrid key", r"\bSG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b"),
    ("Twilio key", r"\bSK[0-9a-fA-F]{32}\b"),
    ("generic bearer token", r"(?i)\bauthorization\s*[:=]\s*['\"]?bearer\s+[A-Za-z0-9._\-]{20,}"),
]

COMPILED_VENDOR = [(name, re.compile(pattern)) for name, pattern in VENDOR_PATTERNS]

# A quoted value assigned to a secret-shaped name. Deliberately narrow: the
# value must be quoted and reasonably long, because bare and short values are
# almost all false positives in a codebase like this one.
#
# Bare "token" is not in this list. It is far more often a design token, a
# parser token or a CSS custom property name than a credential, and including
# it made the scanner cry wolf over src/lib/tokens.ts.
GENERIC_ASSIGNMENT = re.compile(
    r"""(?ix)
    \b (?: api[_-]?key | apikey | secret | passwd | password
         | access[_-]?token | auth[_-]?token | api[_-]?token
         | refresh[_-]?token | bearer[_-]?token
         | client[_-]?secret | private[_-]?key | credentials? )
    \b \s* [:=] \s*
    (['"])
    ([^'"\n]{12,})
    \1
    """
)

# Shapes a credential never takes. A custom property name and a sentence both
# turn up as quoted values next to words like "credentials" in ordinary code.
NOT_A_SECRET = re.compile(r"^--|\s")

# Anything matching here is a stand-in, not a credential. [REPLACE] is this
# project's own marker for unknown content (CLAUDE.md section 5) and must
# never trip the scanner.
PLACEHOLDER = re.compile(
    r"""(?ix)
    \[REPLACE\] | example | placeholder | changeme | change[_-]me
    | your[-_ ] | \bxxx+ | \.\.\. | <[^>]+> | \$\{ | \$\( | %s | \{\{
    | process\.env | import\.meta\.env | os\.environ | getenv
    | dummy | sample | redacted | fake | lorem | \btbd\b | \btodo\b
    | ^(?:string|number|boolean|null|true|false)$
    """
)

# Files that should never be staged at all, whatever is inside them.
FORBIDDEN_PATHS = re.compile(
    r"""(?ix)
    (?: ^|/ )
    (?: \.env (?: \.[^/]* )?          # .env, .env.local, .env.production
      | id_rsa | id_dsa | id_ecdsa | id_ed25519
      | .*\.pem | .*\.pfx | .*\.p12 | .*\.keystore | .*\.jks
      | credentials\.json | service-account.*\.json
      | \.npmrc | \.pypirc | \.netrc
    ) $
    """
)


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
    return True, result.stdout


def added_lines(diff):
    """Yield (path, line) for every line the diff adds."""
    path = "?"
    for raw in diff.splitlines():
        if raw.startswith("+++ b/"):
            path = raw[6:]
        elif raw.startswith("+++ "):
            path = raw[4:]
        elif raw.startswith("+") and not raw.startswith("+++"):
            yield path, raw[1:]


def scan(diff):
    """Return a list of human-readable findings."""
    findings = []
    for path, line in added_lines(diff):
        # Keep the reported excerpt short so a minified bundle cannot dump
        # a thousand columns into the refusal message.
        excerpt = line.strip()[:120]
        for name, pattern in COMPILED_VENDOR:
            if pattern.search(line):
                findings.append(f"{path}: {name} — {excerpt}")
                break
        else:
            match = GENERIC_ASSIGNMENT.search(line)
            if (
                match
                and not PLACEHOLDER.search(match.group(2))
                and not NOT_A_SECRET.search(match.group(2))
            ):
                findings.append(f"{path}: hardcoded secret value — {excerpt}")
    return findings


def main():
    command = read_tool_input()
    if command is None:
        allow()
    if not commit_segments(command):
        allow()

    ok, staged = git("diff", "--cached", "--name-only")
    if not ok:
        block(
            "Secret scan could not read the staged file list, so this commit "
            f"is unverified and blocked.\n  git said: {staged}"
        )

    staged_files = [p for p in staged.splitlines() if p.strip()]
    if not staged_files:
        # Nothing staged. Let git produce its own error rather than inventing one.
        allow()

    forbidden = [p for p in staged_files if FORBIDDEN_PATHS.search(p)]
    if forbidden:
        listing = "\n".join(f"  - {p}" for p in forbidden)
        block(
            "Blocked: these staged files hold credentials by convention and "
            "must not be committed.\n"
            f"{listing}\n\n"
            "Unstage them with `git restore --staged <path>` and add them to "
            ".gitignore."
        )

    ok, diff = git("diff", "--cached", "--no-color", "--unified=0")
    if not ok:
        block(
            "Secret scan could not read the staged diff, so this commit is "
            f"unverified and blocked.\n  git said: {diff}"
        )

    findings = scan(diff)
    if findings:
        listing = "\n".join(f"  - {f}" for f in findings[:20])
        extra = "" if len(findings) <= 20 else f"\n  ...and {len(findings) - 20} more"
        block(
            "Blocked: the staged diff looks like it contains live "
            f"credentials.\n{listing}{extra}\n\n"
            "Move the value into an environment variable, or mark it "
            "[REPLACE] if it is a stand-in."
        )

    allow()


if __name__ == "__main__":
    main()
