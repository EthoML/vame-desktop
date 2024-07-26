from pathlib import Path
from typing import Union
import yaml

def get_evaluation_images(project_path: Path):
    evaluation_output = project_path / 'model' / 'evaluate'
    png_files = list(evaluation_output.glob('*.png'))
    return [ str(png_file.relative_to(project_path)) for png_file in png_files ]

def get_visualization_images(project_path, parametrization):
    community_subfolders = get_video_related_asset(
        project_path,
        subpath=Path(parametrization) / 'community',
        validate=True
    )

    visualization_images = dict()

    for video_set, community_subfolder in community_subfolders.items():
        if community_subfolder:
            visualization_images[video_set] = [ str(image.relative_to(project_path)) for image in community_subfolder.glob('umap_*.png') ]
        else:
            visualization_images[video_set] = []


    return visualization_images

def get_video_related_asset(
        project_path,
        subpath: Union[str, callable],
        return_path = True,
        validate = False
    ):

    results_location = project_path / 'results'
    config = yaml.safe_load(open(project_path / 'config.yaml', "r"))

    video_sets = config["video_sets"]
    model_name = config["model_name"]

    video_related_assets = dict()

    for video_set in video_sets:
        video_set_subpath = subpath(video_set) if callable(subpath) else subpath
        asset_path = results_location / video_set / model_name / video_set_subpath
        video_related_assets[video_set] = asset_path if return_path else str(asset_path)
        if validate and not asset_path.exists():
            video_related_assets[video_set] = None

    return video_related_assets

def get_motif_videos(project_path, algorithm):
    return get_videos(project_path, Path(algorithm) / 'cluster_videos')

def get_community_videos(project_path, algorithm):
    return get_videos(project_path, Path(algorithm) / 'community_videos')

def get_videos(
        project_path,
        subfolder
    ):

    video_subfolders = get_video_related_asset(project_path, subfolder)

    output_videos = dict()

    for video_set, video_subfolder in video_subfolders.items():
        if video_subfolder.exists():
            output_videos[video_set] = [ str(video.relative_to(project_path)) for video in video_subfolder.glob('*.mp4') ]
        else:
            output_videos[video_set] = []

    return output_videos

def get_video_results_path(video, project_path):
    return project_path / 'results' / video / "VAME" / 'hmm-15'