"""Direct writes to a project's ``states/states.json``.

VAME's ``save_state`` scopes state to one function call, so a route composing
several calls into one step must own that step's state itself.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def set_step_state(project_path, step: str, state: str) -> None:
    """Set ``step``'s ``execution_state``, leaving the rest of the file intact.

    Best-effort: never take down the thread doing the work.
    """
    states_path = Path(project_path) / "states" / "states.json"
    try:
        with open(states_path) as f:
            states = json.load(f)
    except (OSError, json.JSONDecodeError):
        logger.warning("Could not read %s to set %s=%s", states_path, step, state)
        return

    if not isinstance(states, dict):
        logger.warning("Unexpected states.json shape at %s", states_path)
        return

    entry = states.get(step)
    if not isinstance(entry, dict):
        entry = {}
        states[step] = entry
    entry["execution_state"] = state

    try:
        with open(states_path, "w") as f:
            json.dump(states, f, indent=4)
    except OSError:
        logger.warning("Could not write %s to set %s=%s", states_path, step, state)
