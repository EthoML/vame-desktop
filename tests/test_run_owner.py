import json
import os

import pytest

from vame_app.services import run_owner


def _project(tmp_path, state="running"):
    (tmp_path / "states").mkdir(parents=True)
    (tmp_path / "states" / "states.json").write_text(
        json.dumps({"segment_session": {"execution_state": state, "n_clusters": 15}})
    )
    return tmp_path


def _states(tmp_path):
    return json.loads((tmp_path / "states" / "states.json").read_text())


def test_live_owner_is_left_running(tmp_path):
    p = _project(tmp_path)
    run_owner.claim(p, "segment_session")
    resolved = run_owner.resolve_states(p, _states(p))
    assert resolved["segment_session"]["execution_state"] == "running"


def test_dead_owner_is_reported_failed(tmp_path):
    p = _project(tmp_path)
    (p / "states" / "run_owner.json").write_text(json.dumps({"segment_session": 999999}))
    resolved = run_owner.resolve_states(p, _states(p))
    assert resolved["segment_session"]["execution_state"] == "failed"


def test_never_writes_to_states_json(tmp_path):
    p = _project(tmp_path)
    (p / "states" / "run_owner.json").write_text(json.dumps({"segment_session": 999999}))
    before = (p / "states" / "states.json").read_text()
    run_owner.resolve_states(p, _states(p))
    assert (p / "states" / "states.json").read_text() == before


def test_unowned_running_is_left_alone(tmp_path):
    """Pre-existing projects have no owner file; don't guess."""
    p = _project(tmp_path)
    resolved = run_owner.resolve_states(p, _states(p))
    assert resolved["segment_session"]["execution_state"] == "running"


def test_other_fields_are_preserved(tmp_path):
    p = _project(tmp_path)
    (p / "states" / "run_owner.json").write_text(json.dumps({"segment_session": 999999}))
    resolved = run_owner.resolve_states(p, _states(p))
    assert resolved["segment_session"]["n_clusters"] == 15


def test_claim_records_this_process(tmp_path):
    p = _project(tmp_path)
    run_owner.claim(p, "train_model")
    owners = json.loads((p / "states" / "run_owner.json").read_text())
    assert owners["train_model"] == os.getpid()


def test_claim_keeps_other_steps(tmp_path):
    p = _project(tmp_path)
    run_owner.claim(p, "train_model")
    run_owner.claim(p, "segment_session")
    owners = json.loads((p / "states" / "run_owner.json").read_text())
    assert set(owners) == {"train_model", "segment_session"}


def test_creating_the_app_does_not_touch_a_discoverable_running_project(
    tmp_path, monkeypatch
):
    """A second server must not disturb a live run."""
    from vame_app.services import project_service

    projects_dir = tmp_path / "projects"
    p = _project(projects_dir / "proj")
    (p / "config.yaml").write_text("project_path: x\n")
    monkeypatch.setattr(project_service, "VAME_PROJECTS_DIRECTORY", projects_dir)
    monkeypatch.setattr(project_service, "GLOBAL_STATES_FILE", tmp_path / "states.json")
    assert str(p.resolve()) in project_service.get_projects()

    run_owner.claim(p, "segment_session")
    before = (p / "states" / "states.json").read_text()

    from vame_app import create_app

    create_app()

    assert (p / "states" / "states.json").read_text() == before


def test_delete_refuses_while_a_live_run_owns_a_step(tmp_path, monkeypatch):
    from vame_app.services import project_service

    p = _project(tmp_path / "projects" / "busy")
    (p / "config.yaml").write_text("project_path: x\n")
    monkeypatch.setattr(
        project_service, "VAME_PROJECTS_DIRECTORY", tmp_path / "projects"
    )
    monkeypatch.setattr(
        project_service, "GLOBAL_STATES_FILE", tmp_path / "states.json"
    )
    run_owner.claim(p, "segment_session")

    with pytest.raises(project_service.ProjectBusyError):
        project_service.delete_project(p)

    assert (p / "config.yaml").exists()


def test_delete_proceeds_when_the_running_owner_is_dead(tmp_path, monkeypatch):
    """A crashed server must not leave a project undeletable."""
    from vame_app.services import project_service

    p = _project(tmp_path / "projects" / "orphaned")
    (p / "config.yaml").write_text("project_path: x\n")
    (p / "states" / "run_owner.json").write_text(json.dumps({"segment_session": 999999}))
    monkeypatch.setattr(
        project_service, "VAME_PROJECTS_DIRECTORY", tmp_path / "projects"
    )
    monkeypatch.setattr(
        project_service, "GLOBAL_STATES_FILE", tmp_path / "states.json"
    )

    assert project_service.delete_project(p)["deleted"] is True
    assert not p.exists()


def test_delete_proceeds_when_nothing_is_running(tmp_path, monkeypatch):
    from vame_app.services import project_service

    p = _project(tmp_path / "projects" / "idle", state="success")
    (p / "config.yaml").write_text("project_path: x\n")
    monkeypatch.setattr(
        project_service, "VAME_PROJECTS_DIRECTORY", tmp_path / "projects"
    )
    monkeypatch.setattr(
        project_service, "GLOBAL_STATES_FILE", tmp_path / "states.json"
    )
    run_owner.claim(p, "segment_session")

    assert project_service.delete_project(p)["deleted"] is True
    assert not p.exists()


def test_is_project_ready_on_deleted_project(tmp_path):
    from vame_app.services.project_service import is_project_ready

    assert is_project_ready(tmp_path / "gone") == {"is_ready": True}


def test_is_project_ready_ignores_orphaned_running(tmp_path):
    from vame_app.services.project_service import is_project_ready

    p = _project(tmp_path)
    (p / "states" / "run_owner.json").write_text(json.dumps({"segment_session": 999999}))
    assert is_project_ready(p) == {"is_ready": True}
