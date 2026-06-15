from pathlib import Path
from flask_restx import Resource
from flask import request, jsonify
import base64

import vame

from . import api
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception


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
            vame.visualization.preprocessing.preprocessing_visualization(
                config=config,
                save_to_file=True,
                show_figure=False,
            )
            return jsonify(dict(result="success"))

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
