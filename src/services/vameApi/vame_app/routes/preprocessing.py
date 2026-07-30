from pathlib import Path
import threading
import time
from flask_restx import Namespace, Resource
from flask import request, jsonify
import base64

import vame

from vame_app.services.step_state import set_step_state
from vame_app.services.run_owner import claim
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception

api = Namespace("preprocessing", description="Pose data preprocessing", path="/")


def run_preprocessing(config: dict, project_path, data: dict):
    """Run the whole "2.1 Run Preprocessing" step: preprocess, then visualize.

    vame.preprocessing() publishes its own "success" on return, so the state is
    re-set below to cover the visualization.
    """
    try:
        set_step_state(project_path, "preprocessing", "running")
        vame.preprocessing(
            config=config,
            centered_reference_keypoint=data["centered_reference_keypoint"],
            orientation_reference_keypoint=data["orientation_reference_keypoint"],
            run_lowconf_cleaning=data["run_lowconf_cleaning"],
            run_egocentric_alignment=data["run_egocentric_alignment"],
            run_outlier_cleaning=data["run_outlier_cleaning"],
            run_savgol_filtering=data["run_savgol_filtering"],
            run_rescaling=data["run_rescaling"],
            save_logs=True,
        )
        # vame.preprocessing just published "success"; the step is not done yet.
        set_step_state(project_path, "preprocessing", "running")
        vame.visualization.preprocessing.preprocessing_visualization(
            config=config,
            save_to_file=True,
            show_figure=False,
        )
        set_step_state(project_path, "preprocessing", "success")
    except Exception:
        set_step_state(project_path, "preprocessing", "failed")
        raise


@api.route("/preprocessing", methods=["POST"])
class Preprocess(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            # Per-step parameters live in the config; persist any the user set so
            # the cleaning/filtering sub-steps pick them up.
            for key in ("pose_confidence", "robust", "iqr_factor", "savgol_length", "savgol_order"):
                if data.get(key) is not None:
                    config[key] = data[key]
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            thread = threading.Thread(
                target=run_preprocessing,
                kwargs={"config": config, "project_path": project_path, "data": data},
            )
            claim(project_path, "preprocessing")
            thread.start()
            time.sleep(2)  # Give the thread a moment to start
            return {"status": "started"}

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/preprocessing-images", methods=["POST"])
class PreprocessingImages(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            session_name = data["session_name"]
            images_path = Path(project_path) / "reports" / "figures"
            images_content = dict()
            if (images_path / f"{session_name}_preprocessing_timeseries.png").exists():
                with open(
                    images_path / f"{session_name}_preprocessing_timeseries.png", "rb"
                ) as image_file:
                    images_content["timeseries"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")
            if (images_path / f"{session_name}_preprocessing_scatter.png").exists():
                with open(
                    images_path / f"{session_name}_preprocessing_scatter.png", "rb"
                ) as image_file:
                    images_content["scatter"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")
            if (images_path / f"{session_name}_preprocessing_cloud.png").exists():
                with open(
                    images_path / f"{session_name}_preprocessing_cloud.png", "rb"
                ) as image_file:
                    images_content["cloud"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")
            return jsonify(images_content)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
