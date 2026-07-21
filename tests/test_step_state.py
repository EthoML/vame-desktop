"""set_step_state writes one step's status without disturbing the rest."""

import json

from vame_app.services.step_state import set_step_state


def _project(tmp_path, states):
    (tmp_path / "states").mkdir()
    (tmp_path / "states" / "states.json").write_text(json.dumps(states))
    return tmp_path


def _read(tmp_path):
    return json.loads((tmp_path / "states" / "states.json").read_text())


def test_sets_the_requested_step(tmp_path):
    p = _project(tmp_path, {"generate_reports": {"execution_state": "running"}})
    set_step_state(p, "generate_reports", "success")
    assert _read(p)["generate_reports"]["execution_state"] == "success"


def test_leaves_other_steps_and_fields_untouched(tmp_path):
    p = _project(
        tmp_path,
        {
            "train_model": {"execution_state": "success", "max_epochs": 8},
            "generate_reports": {"execution_state": "running", "num_points": 30000},
        },
    )
    set_step_state(p, "generate_reports", "failed")
    states = _read(p)
    assert states["train_model"] == {"execution_state": "success", "max_epochs": 8}
    # The step's own parameters survive; only its status changes.
    assert states["generate_reports"] == {
        "execution_state": "failed",
        "num_points": 30000,
    }


def test_creates_an_entry_for_a_step_never_run(tmp_path):
    p = _project(tmp_path, {"generate_reports": {}})
    set_step_state(p, "generate_reports", "running")
    assert _read(p)["generate_reports"]["execution_state"] == "running"


def test_missing_or_corrupt_file_does_not_raise(tmp_path):
    # Reporting state must never take down the thread doing the real work.
    set_step_state(tmp_path / "nonexistent", "generate_reports", "failed")

    p = tmp_path / "corrupt"
    (p / "states").mkdir(parents=True)
    (p / "states" / "states.json").write_text("{not json")
    set_step_state(p, "generate_reports", "failed")
