import json
import yaml
import os
from pathlib import Path

from app.config import VAME_PROJECTS_DIRECTORY,GLOBAL_STATES_FILE

from app.utils.get_files import get_files
from app.utils.get_project_path import get_project_path
from app.utils.get_assets import get_evaluation_images, get_visualization_images, get_motif_videos, get_community_videos, get_video_results_path
from app.utils.get_pose_ref_index_description import get_pose_ref_index_description

def get_projects():
    projects = [str(project) for project in VAME_PROJECTS_DIRECTORY.glob('*') if project.is_dir()]
    return projects

def get_recent_projects():
    with open(GLOBAL_STATES_FILE, "r") as inp:
        states = json.load(fp=inp)
    # states = json.loads(open(GLOBAL_STATES_FILE, "r").read())
    recent_projects = states.get("recent_projects", [])

    # Filter those that no longer exist
    recent_projects = [ str(project) for project in recent_projects if (VAME_PROJECTS_DIRECTORY / project).exists() ]
    states["recent_projects"] = recent_projects
    with open(GLOBAL_STATES_FILE, "w") as file:
        json.dump(states, file)

    return recent_projects

def is_project_ready(project_path: Path):
  states_path = Path(project_path) / "states" / "states.json"

  with open(states_path, "r") as file:
      states = json.load(fp=file)

  if states is None:
      return dict(is_ready=True)

  for _, value in states.items():
      execution_state = value.get("execution_state", None)
      if execution_state == "running":
          return dict(is_ready=False)

  return dict(is_ready=True)

def register_recent_projetc(project_path: Path):
    with open(GLOBAL_STATES_FILE, "r") as inp:
        states = json.load(fp=inp)

    recent_projects = states.get("recent_projects", [])

    project_path = str(project_path)

    if project_path in recent_projects:
        recent_projects.remove(project_path)

    recent_projects.append(project_path)

    if len(recent_projects) > 5:
        recent_projects = recent_projects[-5:]

    with open(GLOBAL_STATES_FILE, "w") as file:
        json.dump({
            **states,
            "recent_projects": recent_projects
        }, file)

    return recent_projects

def create_project(data):
    import vame
    project_path = get_project_path(data["project"], VAME_PROJECTS_DIRECTORY)

    created = not project_path.exists()

    config_path = Path(vame.init_new_project(
        working_directory=VAME_PROJECTS_DIRECTORY,
        **data
    ))

    return dict(
        project=str(config_path.parent),
        created=created,
        config=yaml.safe_load(open(config_path, "r"))
    )

def delete_project(project_path):
    if project_path.exists():
        import shutil
        shutil.rmtree(project_path, ignore_errors=True)
        return (dict(project=str(project_path), deleted=True))

    return dict(project=str(project_path), deleted=False)

def configure_project(data, project_path: Path):
    from vame.util import auxiliary
    config_path = project_path / "config.yaml"

    if config_path.exists():
        with open(config_path, "r") as file:
            config = yaml.safe_load(file)
            config_update = data["config"]

            if config_update:
                config.update(config_update)
                auxiliary.write_config(config_path, config)

            return dict(config=config)

    return dict(config=None)

def load_project(project_path: Path):
    config_path = project_path / "config.yaml"

    # Create a symlink to the project directory if it isn't in the VAME_PROJECTS_DIRECTORY
    if project_path.parent != VAME_PROJECTS_DIRECTORY:
        symlink = VAME_PROJECTS_DIRECTORY / project_path.name
        if not symlink.exists():
            symlink.symlink_to(project_path)

    states_path = Path(project_path) / "states" / "states.json"
    states = json.load(open(states_path)) if os.path.exists(states_path) else None
    config = yaml.safe_load(open(config_path, "r")) if config_path.exists() else None

    # Extract parameters from the config
    parametrizations = config["parametrizations"]  # e.g., ["hmm", "kmeans"]
    n_cluster = config["n_cluster"]  # e.g., 28

    # Create the visualization dictionary dynamically
    visualization = {
        param: get_visualization_images(project_path, f"{param}-{n_cluster}")
        for param in parametrizations
    }

    images = dict(
        evaluation=get_evaluation_images(project_path),
        visualization=visualization
    )

    # Create the videos dictionary dynamically
    videos = {
        category: {
            param: get_motif_videos(project_path, f"{param}-{n_cluster}")
            for param in parametrizations
        }
        for category in ['motif', 'community']
    }

    has_latent_vector_files = False
    if config:
        has_latent_vector_files = all(
            map(lambda video: (get_video_results_path(video, project_path) / f"latent_vector_{video}.npy").exists(), config["video_sets"])
        )

    has_communities = (project_path / 'cohort_community_label.npy').exists()

    original_videos_location = project_path / 'videos'
    original_csvs_location = original_videos_location / 'pose_estimation'

    # Get all files in the original data directory
    original_videos = list(map(str, get_files(original_videos_location)))
    original_csvs = list(map(str, get_files(original_csvs_location)))

    # Check if motif videos were created for each parametrization
    motif_videos_created = {
        param: all(map(lambda videos: len(videos) > 0, videos["motif"][param].values()))
        for param in parametrizations
    }

    # Check if community videos were created for each parametrization
    community_videos_created = {
        param: all(map(lambda videos: len(videos) > 0, videos["community"][param].values()))
        for param in parametrizations
    }

    # Check if UMAPs were created for each parametrization
    umaps_created = {
        param: any(map(lambda videos: len(videos) > 0, images["visualization"][param].values()))
        for param in parametrizations
    }

    pose_ref_index_description, ref_index_len = get_pose_ref_index_description(original_csvs[0])

    # Provide project workflow status
    workflow = dict(
        organized=(project_path / 'data' / 'train').exists(),
        pose_ref_index_description=pose_ref_index_description,
        ref_index_len=ref_index_len,
        modeled=len(images["evaluation"]) > 0,
        segmented=has_latent_vector_files,
        motif_videos_created=any(motif_videos_created.values()),
        communities_created=has_communities,
        community_videos_created=any(community_videos_created.values()),
        umaps_created=any(umaps_created.values()),
    )

    return dict(
        project=str(config_path.parent),
        config=config,
        assets=dict(
            images=images,
            videos=videos
        ),
        videos=original_videos,
        csvs=original_csvs,
        workflow=workflow,
        states=states
    )
