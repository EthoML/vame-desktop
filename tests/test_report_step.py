"""The 6.1 Generate Report step must not publish "success" before it is done.

Regression: the step ran generate_reports (which writes its own "success" via
VAME's save_state decorator) and only then computed the UMAP figures. For the
whole UMAP phase the UI showed "Report generation completed successfully" while
reports/umap/ was still empty, and a UMAP crash left the step reading "success"
forever.
"""

import json

import pytest

from vame_app.routes import report as report_route


@pytest.fixture
def project(tmp_path):
    (tmp_path / "states").mkdir()
    (tmp_path / "states" / "states.json").write_text(
        json.dumps({"generate_reports": {"execution_state": "not_found"}})
    )
    return tmp_path


def _state(project):
    states = json.loads((project / "states" / "states.json").read_text())
    return states["generate_reports"]["execution_state"]


@pytest.fixture
def fake_vame(monkeypatch, project):
    """Stand in for the two VAME calls, recording order and observed state."""

    calls = []

    def visualize_umap(config, num_points):
        calls.append(("visualize_umap", _state(project)))

    def generate_reports(config):
        calls.append(("generate_reports", _state(project)))
        # Mimic the save_state decorator's terminal write.
        from vame_app.services.step_state import set_step_state

        set_step_state(config["project_path"], "generate_reports", "success")

    monkeypatch.setattr(report_route.vame.visualization, "visualize_umap", visualize_umap)
    monkeypatch.setattr(report_route.vame.visualization, "generate_reports", generate_reports)
    return calls


def test_umap_runs_before_reports(project, fake_vame):
    """Ordering is what makes the step's final "success" trustworthy."""
    report_route.generate_report_artifacts(
        config={"project_path": str(project)}, num_points=100, overwrite_umap=False
    )
    assert [name for name, _ in fake_vame] == ["visualize_umap", "generate_reports"]


def test_step_reads_running_while_umap_is_in_flight(project, fake_vame):
    report_route.generate_report_artifacts(
        config={"project_path": str(project)}, num_points=100, overwrite_umap=False
    )
    observed = dict(fake_vame)
    assert observed["visualize_umap"] == "running", (
        "the step must not look finished while UMAP is still computing"
    )


def test_success_only_after_everything_ran(project, fake_vame):
    report_route.generate_report_artifacts(
        config={"project_path": str(project)}, num_points=100, overwrite_umap=False
    )
    assert _state(project) == "success"


def test_umap_failure_is_recorded_not_swallowed(project, monkeypatch):
    def boom(config, num_points):
        raise RuntimeError("umap exploded")

    def generate_reports(config):
        pytest.fail("generate_reports must not run after UMAP failed")

    monkeypatch.setattr(report_route.vame.visualization, "visualize_umap", boom)
    monkeypatch.setattr(report_route.vame.visualization, "generate_reports", generate_reports)

    with pytest.raises(RuntimeError, match="umap exploded"):
        report_route.generate_report_artifacts(
            config={"project_path": str(project)}, num_points=100, overwrite_umap=False
        )
    assert _state(project) == "failed", "a UMAP crash must not leave the step at success"


def test_overwrite_umap_drops_the_cache(project, fake_vame):
    results = project / "results"
    results.mkdir()
    cache = results / "umap_embedding.nc"
    cache.write_text("stale")

    report_route.generate_report_artifacts(
        config={"project_path": str(project)}, num_points=100, overwrite_umap=True
    )
    assert not cache.exists()


def test_cache_survives_when_overwrite_not_requested(project, fake_vame):
    results = project / "results"
    results.mkdir()
    cache = results / "umap_embedding.nc"
    cache.write_text("reuse me")

    report_route.generate_report_artifacts(
        config={"project_path": str(project)}, num_points=100, overwrite_umap=False
    )
    assert cache.read_text() == "reuse me"
