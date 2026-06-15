from pathlib import Path
from urllib.parse import quote
import threading
import time
from flask_restx import Resource
from flask import request, jsonify
import base64
import vame

from . import api
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/report", methods=["POST", "GET"])
class Report(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict, num_points: int, overwrite_umap: bool):
            vame.visualization.generate_reports(config=config)
            # visualize_umap caches results/umap_embedding.nc and reuses it when
            # present, so new UMAP settings won't apply unless we drop the cache.
            if overwrite_umap:
                umap_cache = Path(config["project_path"]) / "results" / "umap_embedding.nc"
                if umap_cache.exists():
                    umap_cache.unlink()
            # UMAP embeddings are cohort-wide (all sessions combined) and are
            # written to reports/umap/. They are part of the report artifacts,
            # so generate them in the same step (logs to the same report.log).
            vame.visualization.visualize_umap(config=config, num_points=num_points)

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            # UMAP layout params are read from config; num_points is a kwarg.
            if data.get("n_neighbors") is not None:
                config["n_neighbors"] = int(data["n_neighbors"])
            if data.get("min_dist") is not None:
                config["min_dist"] = float(data["min_dist"])
            num_points = int(data["num_points"]) if data.get("num_points") is not None else config.get("num_points", 30000)
            overwrite_umap = bool(data.get("overwrite_umap"))
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            thread = threading.Thread(
                target=background_task,
                kwargs={"config": config, "num_points": num_points, "overwrite_umap": overwrite_umap},
            )
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
        session = request.args.get("session")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        if not project_path or not segmentation_algorithm:
            api.abort(400, "Missing 'project' or 'segmentation_algorithm'")
        try:
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            model_name = config.get("model_name")
            file_path = (
                Path(project_path)
                / "reports"
                / f"community_motifs_{session}_{model_name}_{segmentation_algorithm}-{n_clusters}.png"
            )
            if file_path.exists():
                content = base64.b64encode(file_path.read_bytes()).decode()
                report_image = {"filename": file_path.name, "content": content}
                return {"report_image": report_image}
            # Not generated yet (background report task may still be running)
            return {"report_image": None}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/umap", methods=["GET"])
class Umap(Resource):
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
            model_name = config.get("model_name")
            # Serve the interactive Plotly HTML (cohort-wide, no session segment).
            # It is self-contained and carries its own labeling controls (no-label
            # / motif / community), so it replaces the three static PNGs and their
            # view selector. Return a streamable URL via the /files static route;
            # null while the background report task hasn't written it yet, so the
            # UI shows an empty state rather than erroring.
            project_name = Path(project_path).name
            rel = f"reports/umap/umap_{model_name}_{segmentation_algorithm}-{n_clusters}_interactive.html"
            html_url = "/files/" + quote(f"{project_name}/{rel}") if (Path(project_path) / rel).exists() else None
            return {"umap_html_url": html_url}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
