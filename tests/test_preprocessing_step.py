"""The 2.1 Preprocessing step spans two VAME calls under one state key.

vame.preprocessing() publishes its own "success" as soon as it returns, but the
step is not done until preprocessing_visualization() has run too. Unlike the
report step these cannot be reordered — the visualization consumes the
preprocessed data — so the step's state is managed explicitly.
"""

import json

import pytest

from vame_app.routes import preprocessing as preprocessing_route
from vame_app.services.step_state import set_step_state

PARAMS = {
    "centered_reference_keypoint": "Sternum",
    "orientation_reference_keypoint": "Tailbase",
    "run_lowconf_cleaning": True,
    "run_egocentric_alignment": True,
    "run_outlier_cleaning": True,
    "run_savgol_filtering": True,
    "run_rescaling": True,
}


@pytest.fixture
def project(tmp_path):
    (tmp_path / "states").mkdir()
    (tmp_path / "states" / "states.json").write_text(
        json.dumps({"preprocessing": {"execution_state": "not_found"}})
    )
    return tmp_path


def _state(project):
    states = json.loads((project / "states" / "states.json").read_text())
    return states["preprocessing"]["execution_state"]


@pytest.fixture
def fake_vame(monkeypatch, project):
    """Stand in for the two VAME calls, recording the state each one observed."""
    calls = []

    def preprocessing(**kwargs):
        calls.append(("preprocessing", _state(project)))
        # Mimic the save_state decorator's terminal write.
        set_step_state(str(project), "preprocessing", "success")

    def visualization(**kwargs):
        calls.append(("visualization", _state(project)))

    monkeypatch.setattr(preprocessing_route.vame, "preprocessing", preprocessing)
    monkeypatch.setattr(
        preprocessing_route.vame.visualization.preprocessing,
        "preprocessing_visualization",
        visualization,
    )
    return calls


def _run(project):
    preprocessing_route.run_preprocessing(
        config={"project_path": str(project)}, project_path=str(project), data=dict(PARAMS)
    )


def test_both_calls_run_in_order(project, fake_vame):
    _run(project)
    assert [name for name, _ in fake_vame] == ["preprocessing", "visualization"]


def test_step_reads_running_while_visualization_is_pending(project, fake_vame):
    """The regression: vame.preprocessing's own "success" must not end the step."""
    _run(project)
    observed = dict(fake_vame)
    assert observed["visualization"] == "running", (
        "step looked finished while the visualization was still being generated"
    )


def test_success_only_after_both_calls(project, fake_vame):
    _run(project)
    assert _state(project) == "success"


def test_visualization_failure_is_recorded(project, monkeypatch):
    def preprocessing(**kwargs):
        set_step_state(str(project), "preprocessing", "success")

    def boom(**kwargs):
        raise RuntimeError("visualization exploded")

    monkeypatch.setattr(preprocessing_route.vame, "preprocessing", preprocessing)
    monkeypatch.setattr(
        preprocessing_route.vame.visualization.preprocessing,
        "preprocessing_visualization",
        boom,
    )

    with pytest.raises(RuntimeError, match="visualization exploded"):
        _run(project)
    assert _state(project) == "failed", (
        "a visualization crash must not leave the step reading success"
    )


def test_preprocessing_failure_is_recorded(project, monkeypatch):
    def boom(**kwargs):
        raise RuntimeError("preprocessing exploded")

    monkeypatch.setattr(preprocessing_route.vame, "preprocessing", boom)

    with pytest.raises(RuntimeError, match="preprocessing exploded"):
        _run(project)
    assert _state(project) == "failed"
