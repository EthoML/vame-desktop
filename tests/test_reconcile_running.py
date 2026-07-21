"""load_project must not flip a *live* "running" step to "failed".

Reconciling stale states is only correct for runs orphaned by a previous
process. A run started by this process is real, and clobbering it makes an
in-progress step report failure the moment the UI reloads the project list.
"""

import json

import pytest
import yaml

from vame_app.services import project_service


@pytest.fixture(autouse=True)
def _clean_module_state():
    project_service._RECONCILED_PROJECTS.clear()
    project_service._PROJECT_CACHE.clear()
    yield
    project_service._RECONCILED_PROJECTS.clear()
    project_service._PROJECT_CACHE.clear()


def _project(tmp_path, state):
    (tmp_path / "states").mkdir()
    (tmp_path / "states" / "states.json").write_text(
        json.dumps({"preprocessing": {"execution_state": state}})
    )
    (tmp_path / "config.yaml").write_text(
        yaml.safe_dump({"project_path": str(tmp_path), "session_names": []})
    )
    (tmp_path / "data" / "raw").mkdir(parents=True)
    return tmp_path


def _state(tmp_path):
    return json.loads((tmp_path / "states" / "states.json").read_text())["preprocessing"][
        "execution_state"
    ]


def test_running_survives_load_after_startup_reconcile(tmp_path, monkeypatch):
    """The startup pass ran; a run started after it must not be reset."""
    p = _project(tmp_path, "success")
    monkeypatch.setattr(project_service, "get_projects", lambda: [str(p)])

    project_service.reconcile_stale_running_states()

    # A run starts now — this is live, not stale.
    (p / "states" / "states.json").write_text(
        json.dumps({"preprocessing": {"execution_state": "running"}})
    )

    project_service.load_project(p)
    assert _state(p) == "running"


def test_running_survives_load_for_a_project_registered_after_startup(tmp_path, monkeypatch):
    """A project created in this process cannot hold a stale running state."""
    p = _project(tmp_path, "running")
    monkeypatch.setattr(project_service, "get_projects", lambda: [])
    monkeypatch.setattr(project_service, "_update_global_states", lambda mutator: {})

    project_service.register_project(p)
    project_service.load_project(p)
    assert _state(p) == "running"


def test_stale_running_is_still_healed_at_startup(tmp_path, monkeypatch):
    """The genuine case must keep working."""
    p = _project(tmp_path, "running")
    monkeypatch.setattr(project_service, "get_projects", lambda: [str(p)])

    healed = project_service.reconcile_stale_running_states()

    assert _state(p) == "failed"
    assert p.name in healed


def test_ui_sequence_project_page_then_run_then_home(tmp_path, monkeypatch):
    """Open project (loads it), start a run, navigate Home (loads it again)."""
    p = _project(tmp_path, "success")
    monkeypatch.setattr(project_service, "get_projects", lambda: [str(p)])
    monkeypatch.setattr(project_service, "_update_global_states", lambda mutator: {})

    project_service.reconcile_stale_running_states()  # server startup
    project_service.load_project(p)                   # opening the project page

    (p / "states" / "states.json").write_text(
        json.dumps({"preprocessing": {"execution_state": "running"}})
    )
    project_service._PROJECT_CACHE.clear()            # mtime changed during the run
    project_service.load_project(p)                   # navigating Home

    assert _state(p) == "running"
