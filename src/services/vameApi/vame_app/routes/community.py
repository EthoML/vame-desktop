from pathlib import Path
from urllib.parse import quote
import threading
import time
import base64
from flask_restx import Namespace, Resource
from flask import request
import vame

from vame_app.services.run_owner import claim
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception

api = Namespace("community", description="Community analysis", path="/")


@api.route("/community", methods=["POST"])
class Community(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict, cut_tree: bool):
            vame.community(
                config=config,
                cut_tree=cut_tree,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            cut_tree = data["cut_tree"]
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            thread = threading.Thread(
                target=background_task,
                kwargs={"config": config, "cut_tree": cut_tree},
            )
            claim(project_path, "community")
            thread.start()
            time.sleep(2)
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/community-videos", methods=["POST", "GET"])
class CommunityVideos(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict):
            vame.community_videos(
                config=config,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            thread = threading.Thread(target=background_task, kwargs={"config": config})
            claim(project_path, "community_videos")
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
        project_path = request.args.get("project")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        session = request.args.get("session")
        if not project_path or not segmentation_algorithm or not session:
            api.abort(400, "Missing 'project', 'segmentation_algorithm', or 'session'")
        try:
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            model_name = config.get("model_name")
            sessions = config.get("session_names", [])

            # Validate session exists in project
            if session not in sessions:
                api.abort(400, f"Session '{session}' not found in project")

            # Return streamable URLs (served by the /files static route)
            project_name = Path(project_path).name
            rel_dir = f"results/{session}/{model_name}/{segmentation_algorithm}-{n_clusters}/community_videos"
            dir_path = Path(project_path) / rel_dir
            videos = []
            if dir_path.exists():
                for file_path in sorted(dir_path.glob("*.mp4")):
                    url = "/files/" + quote(f"{project_name}/{rel_dir}/{file_path.name}")
                    videos.append({"filename": file_path.name, "url": url})
            return {"videos": videos}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/community-images", methods=["GET"])
class CommunityImages(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def get(self):
        project_path = request.args.get("project")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        if not project_path or not segmentation_algorithm:
            api.abort(400, "Missing 'project' or 'segmentation_algorithm'")
        try:
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            file_path = (
                Path(project_path)
                / "results"
                / "community_cohort"
                / f"{segmentation_algorithm}-{n_clusters}"
                / "tree.png"
            )
            if file_path.exists():
                content = base64.b64encode(file_path.read_bytes()).decode()
                tree_image = {"filename": file_path.name, "content": content}
                return {"tree_image": tree_image}
            # Not generated yet — return null so the UI shows an empty state
            # rather than erroring.
            return {"tree_image": None}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
