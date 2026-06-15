"""Build Plotly figures of training losses from a model's TensorBoard logs.

VAME's trainer writes scalars to ``{project}/logs/tensorboard/{model_name}``
live during training (both ``batch/*`` and ``epoch/*`` tags). We read those
event files with TensorBoard's EventAccumulator (already installed, since
torch's SummaryWriter depends on it) and emit Plotly figure specs. Returning a
figure dict means the same builder can later feed report/export artifacts.
"""

import logging
from pathlib import Path

import plotly.graph_objects as go
from tensorboard.backend.event_processing.event_accumulator import EventAccumulator

# EventAccumulator logs advisory messages (duplicate graph/run-metadata events,
# directory-watcher progress) on every read. We poll this endpoint every few
# seconds, so quiet it to avoid spamming the server console.
logging.getLogger("tensorboard").setLevel(logging.ERROR)

# (tag, display name) for each curve. Missing tags are skipped silently.
# Train and test are split into separate figures (each with its own legend).
# VAME has no validation split — "test" is the held-out per-epoch evaluation.
_EPOCH_TRAIN_TRACES = [
    ("epoch/train_loss", "train loss"),
    ("epoch/train_mse", "train MSE"),
    ("epoch/train_kl", "train KL"),
    ("epoch/train_kmeans", "train k-means"),
]
_EPOCH_TEST_TRACES = [
    ("epoch/test_loss", "test loss"),
    ("epoch/test_mse", "test MSE"),
    ("epoch/test_kl", "test KL"),
    ("epoch/test_kmeans", "test k-means"),
]
_BATCH_TRACES = [
    ("batch/train_loss", "train loss"),
    ("batch/mse_loss", "MSE"),
    ("batch/kl_loss", "KL"),
    ("batch/kmeans_loss", "k-means"),
]

# Cap batch payload — batch series can be tens of thousands of points. Kept low
# enough that plain SVG traces stay smooth (we avoid WebGL/Scattergl, which
# fails on browsers where WebGL is disabled or the GPU is blocklisted).
_MAX_BATCH_POINTS = 2000


def _tb_log_dir(project_path, model_name: str) -> Path:
    return Path(project_path) / "logs" / "tensorboard" / model_name


def _load_accumulators(log_dir: Path):
    """One EventAccumulator per run, oldest-first.

    VAME appends a new ``events.out.tfevents.*`` file to the same directory on
    every training run. We load each file separately (by mtime) so we can stitch
    the runs end-to-end with a continuous x-axis, rather than letting a single
    directory-level accumulator merge them with overlapping/reset step numbers.
    """
    accumulators = []
    for f in sorted(log_dir.glob("events.out.tfevents.*"), key=lambda p: p.stat().st_mtime):
        acc = EventAccumulator(str(f), size_guidance={"scalars": 0})
        acc.Reload()
        accumulators.append(acc)
    return accumulators


def _series(accumulators, tag: str, max_points: int | None):
    """Concatenate this tag across all runs into one continuous (steps, values).

    Each run is deduped by step and sorted, then re-based so it continues after
    the previous run (cumulative x). This stitches multiple "train" runs of the
    same model into a single line without the backward jump to step 0.
    Returns None if no run logged the tag.
    """
    steps: list[int] = []
    values: list[float] = []
    offset = 0
    for acc in accumulators:
        try:
            events = acc.Scalars(tag)
        except KeyError:
            continue
        by_step = {int(e.step): float(e.value) for e in events}
        if not by_step:
            continue
        run_steps = sorted(by_step)
        base = run_steps[0]
        for s in run_steps:
            steps.append(offset + (s - base))
            values.append(by_step[s])
        offset += (run_steps[-1] - base) + 1  # next run starts right after this one

    if not values:
        return None
    if max_points and len(values) > max_points:
        stride = len(values) // max_points + 1
        steps, values = steps[::stride], values[::stride]
    return steps, values


def _figure(accumulators, traces, title: str, x_title: str, max_points=None) -> go.Figure:
    fig = go.Figure()
    # Plain SVG Scatter for everything (no WebGL dependency). The batch series is
    # downsampled via max_points so SVG stays responsive.
    for tag, name in traces:
        series = _series(accumulators, tag, max_points)
        if not series or not series[1]:
            continue
        steps, values = series
        fig.add_trace(go.Scatter(x=steps, y=values, mode="lines", name=name))
    fig.update_layout(
        title=title,
        xaxis_title=x_title,
        yaxis_title="loss",
        yaxis_type="log",
        legend_title="metric",
        template="plotly_white",
        margin=dict(l=55, r=20, t=45, b=45),
    )
    return fig


def build_training_figures(project_path, model_name: str) -> dict:
    """Return ``{"epoch_train", "epoch_test", "batch", "has_data", "model_name"}``.

    Train and test are separate figures so each carries its own legend. Safe to
    call mid-training and before any events exist (returns empty figures with
    ``has_data=False``).
    """
    log_dir = _tb_log_dir(project_path, model_name)
    epoch_train_fig, epoch_test_fig, batch_fig = go.Figure(), go.Figure(), go.Figure()
    has_data = False

    accumulators = _load_accumulators(log_dir) if log_dir.is_dir() else []
    if accumulators:
        # scalars=0 -> keep every point (no reservoir sampling); we downsample
        # the batch series contiguously ourselves.
        has_data = any(acc.Tags().get("scalars") for acc in accumulators)
        if has_data:
            epoch_train_fig = _figure(accumulators, _EPOCH_TRAIN_TRACES, "Train losses", "epoch")
            epoch_test_fig = _figure(accumulators, _EPOCH_TEST_TRACES, "Test losses", "epoch")
            batch_fig = _figure(
                accumulators, _BATCH_TRACES, "Batch losses", "step",
                max_points=_MAX_BATCH_POINTS,
            )

    return {
        "epoch_train": epoch_train_fig.to_dict(),
        "epoch_test": epoch_test_fig.to_dict(),
        "batch": batch_fig.to_dict(),
        "has_data": has_data,
        "model_name": model_name,
    }
