"""Which process owns each step's in-flight run.

``states.json`` records that a step is ``running`` but not who is running it, so
a crashed server is indistinguishable from a live one. This records the owning
pid beside it; readers report an orphaned ``running`` as ``failed`` without
writing to ``states.json``.
"""

import json
import logging
import os
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

RUNNING = "running"
ORPHANED = "failed"


def _path(project_path) -> Path:
    return Path(project_path) / "states" / "run_owner.json"


def _read(project_path) -> dict:
    try:
        with open(_path(project_path)) as f:
            owners = json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}
    return owners if isinstance(owners, dict) else {}


def claim(project_path, step: str) -> None:
    """Record this process as the owner of ``step``'s run."""
    owners = _read(project_path)
    owners[step] = os.getpid()
    path = _path(project_path)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(owners, f, indent=4)
    except OSError:
        logger.warning("Could not record run owner for %s in %s", step, project_path)


def is_alive(pid) -> bool:
    if not isinstance(pid, int) or pid <= 0:
        return False
    if sys.platform == "win32":
        # os.kill(pid, 0) is not a liveness check on Windows: signal 0 is the
        # same integer value as CTRL_C_EVENT, so it would actually deliver a
        # real Ctrl+C to the target process's console instead of just probing it.
        import ctypes

        PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
        STILL_ACTIVE = 259
        handle = ctypes.windll.kernel32.OpenProcess(
            PROCESS_QUERY_LIMITED_INFORMATION, False, pid
        )
        if not handle:
            return False
        try:
            exit_code = ctypes.c_ulong()
            # A just-exited process object can briefly still open()-succeed;
            # its exit code (rather than open() succeeding) is the real signal.
            if not ctypes.windll.kernel32.GetExitCodeProcess(
                handle, ctypes.byref(exit_code)
            ):
                return False
            return exit_code.value == STILL_ACTIVE
        finally:
            ctypes.windll.kernel32.CloseHandle(handle)
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    return True


def resolve_states(project_path, states: dict) -> dict:
    """Copy of ``states`` with orphaned ``running`` steps reported as failed.

    A step with no recorded owner is left alone: it predates this file, or was
    started by something other than the server.
    """
    if not isinstance(states, dict):
        return states
    owners = _read(project_path)
    if not owners:
        return states

    resolved = {}
    for step, value in states.items():
        if (
            isinstance(value, dict)
            and value.get("execution_state") == RUNNING
            and step in owners
            and not is_alive(owners[step])
        ):
            resolved[step] = {**value, "execution_state": ORPHANED}
        else:
            resolved[step] = value
    return resolved
