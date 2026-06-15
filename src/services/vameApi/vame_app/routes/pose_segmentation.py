from pathlib import Path
from urllib.parse import quote
import threading
import time
from flask_restx import Resource
from flask import request
import vame

from . import api
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/segment", methods=["POST"])
class Segment(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict, overwrite_segmentation: bool, overwrite_embeddings: bool):
            vame.segment_session(
                config=config,
                overwrite_segmentation=overwrite_segmentation,
                overwrite_embeddings=overwrite_embeddings,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            config["n_clusters"] = data["n_clusters"]
            # Which algorithms to run; fall back to both if nothing was selected.
            config["segmentation_algorithms"] = data.get("segmentation_algorithms") or ["hmm", "kmeans"]
            overwrite_segmentation = bool(data.get("overwrite_segmentation"))
            overwrite_embeddings = bool(data.get("overwrite_embeddings"))
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            thread = threading.Thread(
                target=background_task,
                kwargs={
                    "config": config,
                    "overwrite_segmentation": overwrite_segmentation,
                    "overwrite_embeddings": overwrite_embeddings,
                },
            )
            thread.start()
            time.sleep(2)
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/motif-videos", methods=["POST", "GET"])
class MotifVideos(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict):
            vame.motif_videos(
                config=config,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            if data.get("length_of_motif_video") is not None:
                config["length_of_motif_video"] = int(data["length_of_motif_video"])
                vame.write_config(
                    config_path=str(Path(project_path) / "config.yaml"),
                    config=config,
                )
            thread = threading.Thread(target=background_task, kwargs={"config": config})
            thread.start()
            time.sleep(2)
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def get(self):
        project = request.args.get("project")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        session = request.args.get("session")
        if not project or not segmentation_algorithm or not session:
            api.abort(400, "Missing 'project', 'segmentation_algorithm', or 'session'")
        try:
            config = vame.read_config(str(Path(project) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            model_name = config.get("model_name")
            sessions = config.get("session_names", [])

            # Validate session exists in project
            if session not in sessions:
                api.abort(400, f"Session '{session}' not found in project")

            # Return streamable URLs (served by the /files static route)
            project_name = Path(project).name
            rel_dir = f"results/{session}/{model_name}/{segmentation_algorithm}-{n_clusters}/cluster_videos"
            dir_path = Path(project) / rel_dir
            videos = []
            if dir_path.exists():
                for file_path in sorted(dir_path.glob("*.mp4")):
                    url = "/files/" + quote(f"{project_name}/{rel_dir}/{file_path.name}")
                    videos.append({"filename": file_path.name, "url": url})
            return {"videos": videos}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
