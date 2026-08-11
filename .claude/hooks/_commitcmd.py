"""Shared helpers for the PreToolUse(Bash) commit hooks.

Both hooks fire on every single Bash call, so the only thing that matters
for the common case is getting to "not a commit, allow it" fast. Everything
here is cheap string work; nothing shells out until a caller asks it to.
"""

import json
import os
import re
import shlex
import sys

# Split a compound command into its parts so that `grep -n foo && git commit`
# does not read as a commit invoked with -n. Splitting on the operators is
# crude — it does not understand quoting — but it only ever over-splits, and
# an over-split segment fails the `is_git_commit` test and is ignored.
_SEPARATORS = re.compile(r"\|\||&&|[;|&\n]")

_ENV_PREFIX = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")

# Global git options that swallow the token after them, so that the argument
# to `git -C some/commit/dir status` is not mistaken for the subcommand.
_OPTS_TAKING_VALUE = {
    "-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path",
    "--super-prefix", "--config-env",
}


def read_tool_input():
    """Return the Bash command string, or None if this is not a usable event.

    A malformed or empty payload means the harness is not telling us what we
    need to judge. That is a harness problem, not a policy violation, so the
    callers treat None as "allow" rather than bricking every Bash call.
    """
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return None
    if not isinstance(payload, dict):
        return None
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return None
    command = tool_input.get("command")
    return command if isinstance(command, str) else None


def is_git_commit(segment):
    """True if this single segment invokes `git commit`.

    Resolves the subcommand positionally rather than by substring, so that
    `git log --grep=commit` and `git commit-graph write` both read as what
    they are. Requires the segment to *start* with git (after any VAR=val
    prefixes) so that `echo "run git commit"` does not match either.
    """
    try:
        tokens = shlex.split(segment)
    except ValueError:
        # Unbalanced quotes, usually because _SEPARATORS split mid-string.
        # Fall back to the strict adjacent form rather than giving up.
        return re.search(r"(?:^|\s)git\s+commit(?:\s|$)", segment) is not None

    index = 0
    while index < len(tokens) and _ENV_PREFIX.match(tokens[index]):
        index += 1
    if index >= len(tokens) or os.path.basename(tokens[index]) != "git":
        return False

    index += 1
    while index < len(tokens):
        token = tokens[index]
        if token in _OPTS_TAKING_VALUE:
            index += 2
            continue
        if token.startswith("-"):
            index += 1
            continue
        return token == "commit"
    return False


def commit_segments(command):
    """Every segment of `command` that invokes git commit."""
    return [seg for seg in _SEPARATORS.split(command) if is_git_commit(seg)]


def block(message):
    """Refuse the tool call. Exit 2 routes stderr back to Claude."""
    sys.stderr.write(message.rstrip() + "\n")
    sys.exit(2)


def allow():
    sys.exit(0)
