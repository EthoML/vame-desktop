import json
import yaml
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
import portalocker

from vame_app.config import VAME_PROJECTS_DIRECTORY, GLOBAL_STATES_FILE
from vame_app.utils.get_project_path import get_project_path
from vame_app.services.training_config import min_epochs_for_annealing
from vame_app.services.run_owner import resolve_states


# ---------------------------------------------------------------------------
# Global states file (~/vame-app/states.json)
#
# Holds a single registry of known projects keyed by project name:
#
#     {"projects": {"<name>": {"project_path": "/abs/path/to/<name>"}}}
#
# `last_modified` is intentionally NOT stored here — it is derived on read from
# the project's own files (see `_get_project_mtime`), so it can never drift out
# of sync with what actually happened on disk.
# ---------------------------------------------------------------------------


def _update_global_states(mutator: Callable[[dict], None]) -> dict:
    """Read-modify-write the global states file atomically under an exclusive lock.

    `mutator` receives the parsed states dict and mutates it in place.
    Returns the written states.
    """
    GLOBAL_STATES_FILE.parent.mkdir(parents=True, exist_ok=True)
    GLOBAL_STATES_FILE.touch(exist_ok=True)
    with open(GLOBAL_STATES_FILE, "r+") as f:
        portalocker.lock(f, portalocker.LOCK_EX)
        try:
            content = f.read().strip()
            states = json.loads(content) if content else {}
            mutator(states)
            f.seek(0)
            json.dump(states, f, indent=2)
            f.truncate()
        finally:
            portalocker.unlock(f)
    return states


def register_project(project_path) -> dict:
    """Add (or refresh) a project in the registry, keyed by its folder name."""
    path = str(Path(project_path).resolve())
    name = Path(path).name

    def mutate(states: dict) -> None:
        states.pop("recent_projects", None)  # drop legacy key if present
        projects = states.setdefault("projects", {})
        projects[name] = {"project_path": path}

    _update_global_states(mutate)
    return {"registered": name, "project_path": path}


def unregister_project(project_path) -> None:
    """Remove a project from the registry (by name or matching path)."""
    path = str(Path(project_path).resolve())
    name = Path(path).name

    def mutate(states: dict) -> None:
        projects = states.setdefault("projects", {})
        projects.pop(name, None)
        for key in [k for k, v in projects.items() if v.get("project_path") == path]:
            projects.pop(key, None)

    _update_global_states(mutate)


def get_projects():
    """Return the absolute paths of all known projects.

    Self-heals the registry on each call: discovers projects living in the
    VAME projects directory (including symlinks to external projects), folds
    them into the registry, and prunes entries whose ``config.yaml`` is gone.
    """
    discovered = [
        str(project.resolve())
        for project in VAME_PROJECTS_DIRECTORY.glob("*")
        if (project.is_dir() and (project / "config.yaml").exists())
    ]

    def mutate(states: dict) -> None:
        states.pop("recent_projects", None)  # drop legacy key if present
        projects = states.setdefault("projects", {})
        for path in discovered:
            projects[Path(path).name] = {"project_path": path}
        for name in list(projects.keys()):
            project_path = Path(projects[name].get("project_path", ""))
            if not (project_path / "config.yaml").exists():
                projects.pop(name, None)

    states = _update_global_states(mutate)
    return [entry["project_path"] for entry in states.get("projects", {}).values()]


def is_project_ready(project_path: Path):
    states_path = Path(project_path) / "states" / "states.json"

    # A deleted or half-written project has nothing running.
    try:
        with open(states_path, "r") as file:
            states = json.load(fp=file)
    except (OSError, json.JSONDecodeError):
        return dict(is_ready=True)

    if not isinstance(states, dict):
        return dict(is_ready=True)

    states = resolve_states(project_path, states)
    for value in states.values():
        if isinstance(value, dict) and value.get("execution_state") == "running":
            return dict(is_ready=False)

    return dict(is_ready=True)


def create_project(data):
    import vame
    import time

    # Extract project_name from 'project' key (sent by frontend)
    project_name = data.pop("project", None)
    if not project_name:
        raise ValueError("Missing 'project' in project creation data")

    project_path = get_project_path(project_name, str(VAME_PROJECTS_DIRECTORY))
    created = not project_path.exists()

    # Reproducibility seed: init_new_project takes it via config_kwargs, not as a
    # direct kwarg. Omit when missing so VAME's default applies.
    seed = data.pop("project_random_state", None)
    config_kwargs = {"project_random_state": int(seed)} if seed is not None else None

    config_path, config_dict = vame.init_new_project(
        project_name=project_name,
        working_directory=str(VAME_PROJECTS_DIRECTORY),
        config_kwargs=config_kwargs,
        **data,
    )

    # Backend fix: wait until all .nc files exist and are non-empty
    data_raw_path = Path(config_dict["project_path"]) / "data" / "raw"
    session_names = config_dict.get("session_names", [])
    for session in session_names:
        nc_file = data_raw_path / f"{session}.nc"
        retries = 10
        while retries > 0:
            if nc_file.exists() and os.path.getsize(nc_file) > 0:
                break
            time.sleep(0.2)
            retries -= 1

    # Small extra delay to ensure file handles are flushed
    time.sleep(0.2)

    # Record the new project in the global registry.
    register_project(Path(config_path).parent)

    return dict(
        project=str(Path(config_path).parent),
        created=created,
        config=yaml.safe_load(open(config_path, "r")),
    )


def delete_project(project_path):
    if isinstance(project_path, Path):
        path_obj = project_path
    else:
        path_obj = Path(project_path)

    unregister_project(path_obj)

    # Operate on the managed entry under the projects dir (keyed by name), so a
    # linked project only loses its symlink, never the external source data.
    entry = VAME_PROJECTS_DIRECTORY / path_obj.name

    if entry.is_symlink():  # also covers broken symlinks (exists() == False)
        entry.unlink()
        return dict(project=str(entry), deleted=True)

    if entry.is_dir():
        import shutil

        shutil.rmtree(str(entry), ignore_errors=True)
        return dict(project=str(entry), deleted=True)

    # No managed entry on disk: unregister only, never touch external data.
    return dict(project=str(path_obj), deleted=False, unregistered=True)


def configure_project(data, project_path: Path):
    from vame.util.auxiliary import read_config, update_config

    config_path = Path(project_path) / "config.yaml"
    if config_path.exists():
        config = read_config(str(config_path))
        config_update = data.get("config", {})
        config_updated = update_config(
            config=config,
            config_update=config_update,
        )
        return dict(config=config_updated)
    return dict(config=None)


def _validate_config(path_obj: Path, config) -> str | None:
    """Why an already-parsed config makes the project unusable; None if it's fine."""
    if not config:
        return f"Project at {path_obj} is missing or has invalid config.yaml."
    if "segmentation_algorithms" not in config:
        return (
            f"Project at {path_obj} was created by an incompatible VAME version: its "
            "config.yaml has no 'segmentation_algorithms' key (it was previously named "
            "'parametrizations'). Re-create the project from your original pose "
            "estimation files."
        )
    if not any((path_obj / "data" / "raw").glob("*.nc")):
        return (
            f"Project at {path_obj} has no pose estimation (.nc) files under data/raw. "
            "Older VAME versions stored pose data in a different layout. Re-create the "
            "project from your original pose estimation files."
        )
    return None


def validate_project(project_path) -> str | None:
    """Why this project cannot be opened, or None if it is usable.

    Single source of truth for project validity: the /project/validate gate and
    load_project both go through this, so the two cannot drift apart.
    """
    path_obj = Path(project_path)
    config_path = path_obj / "config.yaml"
    if not config_path.exists():
        return (
            f"No config.yaml found in '{path_obj}'. "
            "Please choose a valid VAME project directory."
        )
    try:
        with open(config_path, "r") as file:
            config = yaml.safe_load(file)
    except Exception as exception:
        return f"Could not read config.yaml in '{path_obj}': {exception}"
    return _validate_config(path_obj, config)


# Hybrid cache for /load endpoint
_PROJECT_CACHE = {}
_CACHE_TTL = 10  # seconds


def _get_project_mtime(path_obj):
    # Return the latest mtime of config.yaml and states.json
    config_path = path_obj / "config.yaml"
    states_path = path_obj / "states" / "states.json"
    mtimes = []
    for p in [config_path, states_path]:
        if p.exists():
            mtimes.append(p.stat().st_mtime)
    return max(mtimes) if mtimes else 0


def load_project(project_path: Path):
    try:
        if isinstance(project_path, Path):
            path_obj = project_path
        else:
            path_obj = Path(project_path)
        cache_key = str(path_obj.resolve())
        now = time.time()
        mtime = _get_project_mtime(path_obj)

        # Ensure the projects-dir symlink for an external project before any cache
        # early-return, so a cache hit can't leave it missing.
        if path_obj.parent != VAME_PROJECTS_DIRECTORY:
            symlink = VAME_PROJECTS_DIRECTORY / path_obj.name
            if not symlink.exists() and not symlink.is_symlink():
                VAME_PROJECTS_DIRECTORY.mkdir(parents=True, exist_ok=True)
                symlink.symlink_to(str(path_obj))

        cache_entry = _PROJECT_CACHE.get(cache_key)
        if cache_entry:
            if cache_entry["mtime"] == mtime and (
                now - cache_entry["timestamp"] < _CACHE_TTL
            ):
                print(f"[CACHE] Serving cached project for {cache_key}")
                return cache_entry["data"]
            else:
                print(f"[CACHE] Invalidating cache for {cache_key}")

        config_path = path_obj / "config.yaml"

        # Load the states.json file
        states_path = path_obj / "states" / "states.json"
        if os.path.exists(str(states_path)):
            try:
                with open(str(states_path), "r") as file:
                    states = json.load(fp=file)
            except Exception as e:
                print(f"Error loading states.json for {path_obj}: {e}")
                states = None
        else:
            states = None

        if isinstance(states, dict):
            states = resolve_states(path_obj, states)

        # Load the config.yaml file
        if config_path.exists():
            try:
                with open(str(config_path), "r") as file:
                    config = yaml.safe_load(file)
            except Exception as e:
                print(f"Error loading config.yaml for {path_obj}: {e}")
                config = None
        else:
            config = None

        # Reject an unusable project up front
        reason = _validate_config(path_obj, config)
        if reason:
            result = {"project": str(path_obj), "error": reason}
            _PROJECT_CACHE[cache_key] = {
                "data": result,
                "mtime": mtime,
                "timestamp": now,
            }
            return result

        # Heal a stale project_path (e.g. a project moved/renamed since creation)
        # so it matches where it lives now — the frontend keys on it and VAME
        # locates files through it. Persist via VAME's writer to keep the format.
        actual_project_path = str(path_obj)
        if config.get("project_path") != actual_project_path:
            config["project_path"] = actual_project_path
            try:
                from vame.util.auxiliary import write_config

                write_config(str(config_path), config)
                mtime = _get_project_mtime(path_obj)
            except Exception as e:
                print(f"Could not persist corrected project_path for {path_obj}: {e}")

        # Imported lazily so this module stays torch-free at import time.
        from vame.video.video import is_video_file

        # Get all files in the original data directory.
        videos_paths = [
            str(p.resolve())
            for p in sorted((path_obj / "data" / "raw").glob("*"))
            if is_video_file(p)
        ]
        pes_paths = [str(p.resolve()) for p in (path_obj / "data" / "raw").glob("*.nc")]

        # Create the visualization dictionary dynamically - TODO
        n_clusters = config.get("n_clusters")
        segmentation_algorithms = config["segmentation_algorithms"]

        visualization = {
            param: {}
            for param in segmentation_algorithms
        }

        images = dict(
            evaluation=[],  # get_evaluation_images(project_path),
            visualization=visualization,
        )

        # Create the videos dictionary dynamically - TODO
        videos = {
            category: {
                param: {}  # get_motif_videos(project_path, f"{param}-{n_clusters}")
                for param in segmentation_algorithms
            }
            for category in ["motif", "community"]
        }

        has_latent_vector_files = False
        # if config:
        #     has_latent_vector_files = all(
        #         map(lambda video: (get_video_results_path(video, project_path) / f"latent_vector_{video}.npy").exists(), config["session_names"])
        #     )

        has_communities = (path_obj / "cohort_community_label.npy").exists()

        # Check if motif videos were created for each parametrization
        motif_videos_created = {
            param: all(
                map(lambda videos: len(videos) > 0, videos["motif"][param].values())
            )
            for param in segmentation_algorithms
        }

        # Check if community videos were created for each parametrization
        community_videos_created = {
            param: all(
                map(lambda videos: len(videos) > 0, videos["community"][param].values())
            )
            for param in segmentation_algorithms
        }

        # Check if UMAPs were created for each parametrization. UMAP embeddings
        # are cohort-wide (all sessions combined) and are written to
        # reports/umap/ as umap_<model>_<seg>-<n_clusters>.png.
        model_name = config.get("model_name")
        umap_folder = path_obj / "reports" / "umap"
        umaps_created = {
            param: (umap_folder / f"umap_{model_name}_{param}-{n_clusters}.png").exists()
            for param in segmentation_algorithms
        }

        # Provide project workflow status
        workflow = dict(
            organized=(path_obj / "data" / "train").exists(),
            modeled=len(images["evaluation"]) > 0,
            segmented=has_latent_vector_files,
            motif_videos_created=any(motif_videos_created.values()),
            communities_created=has_communities,
            community_videos_created=any(community_videos_created.values()),
            umaps_created=any(umaps_created.values()),
        )

        # Keep the registry in sync whenever a project is opened.
        register_project(path_obj)

        # `last_modified` is derived on read from the project's own files
        # (config.yaml + states/states.json), never stored — so it always
        # reflects the latest pipeline activity. Cache is keyed on this mtime,
        # so the value refreshes automatically when anything changes.
        last_modified = (
            datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat(timespec="seconds")
            if mtime
            else None
        )

        result = dict(
            project=str(config_path.parent),
            config=config,
            assets=dict(images=images, videos=videos),
            videos=videos_paths,
            pes_paths=pes_paths,
            workflow=workflow,
            states=states,
            last_modified=last_modified,
            min_epochs=min_epochs_for_annealing(config),
        )
        _PROJECT_CACHE[cache_key] = {
            "data": result,
            "mtime": mtime,
            "timestamp": now,
        }
        return result
    except Exception as exception:
        print(f"Exception loading project at {project_path}: {exception}")
        return {
            "project": str(project_path),
            "error": f"Failed to load project at {project_path}: {exception}",
        }
