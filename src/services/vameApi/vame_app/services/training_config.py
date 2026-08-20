# KL weight the trainer requires before it will save a best model.
_SAVE_THRESHOLD = 0.99

# Linear annealing peaks at kl_start + annealtime; sigmoid needs ~6 epochs past
# annealtime. This margin covers both.
_PROBE_MARGIN = 32


def min_epochs_for_annealing(config: dict) -> int | None:
    """Smallest ``max_epochs`` that lets KL annealing reach the save threshold.

    Probes VAME's own ``kl_annealing`` rather than reimplementing it, so this
    cannot drift from the trainer and stays correct for every ``anneal_function``.
    Returns None when the config is unreadable or the threshold is unreachable —
    never block a run on a guess.
    """
    try:
        kl_start = int(config["kl_start"])
        annealtime = int(config["annealtime"])
        anneal_function = str(config["anneal_function"])
    except (KeyError, TypeError, ValueError):
        return None

    # Imported lazily so project_service stays torch-free at import time.
    from vame.model.rnn_vae import kl_annealing

    for epoch in range(1, kl_start + annealtime + _PROBE_MARGIN):
        try:
            weight = kl_annealing(epoch, kl_start, annealtime, anneal_function)
        except (NotImplementedError, ZeroDivisionError):
            return None  # unsupported/degenerate annealing; let VAME rule on it
        if weight > _SAVE_THRESHOLD:
            return epoch + 1  # trainer runs range(1, max_epochs)
    return None


def check_max_epochs(config: dict, max_epochs) -> str | None:
    """Error message if ``max_epochs`` is too low to ever save a model, else None."""
    try:
        max_epochs = int(max_epochs)
    except (TypeError, ValueError):
        return None

    minimum = min_epochs_for_annealing(config)
    if minimum is None or max_epochs >= minimum:
        return None

    return (
        f"Max Epochs must be at least {minimum} for this project, but is {max_epochs}. "
        f"VAME saves a model only after KL annealing completes, which with "
        f"anneal_function={config['anneal_function']}, kl_start={config['kl_start']} "
        f"and annealtime={config['annealtime']} first happens at epoch {minimum - 1}. "
        f"Training with {max_epochs} would run to completion and save no model, "
        f"leaving evaluation with nothing to load. Raise Max Epochs to {minimum} or "
        f"more, or lower 'kl_start'/'annealtime' in the project's config.yaml."
    )
