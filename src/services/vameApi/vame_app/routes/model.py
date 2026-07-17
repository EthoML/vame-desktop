from pathlib import Path
import threading
import time
from flask_restx import Resource
from flask import request, jsonify
import base64
import vame

from . import api
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.utils.not_bad_request_exception import not_bad_request_exception
from vame_app.services.training_metrics import build_training_figures
from vame_app.services.training_config import check_max_epochs


@api.route("/create-trainset", methods=["POST"])
class CreateTrainset(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            # Optional per-split seed override; persist so it becomes the project seed.
            seed = data.get("project_random_state")
            if seed is not None:
                config["project_random_state"] = int(seed)
                vame.write_config(
                    config_path=str(Path(project_path) / "config.yaml"),
                    config=config,
                )
            result = vame.create_trainset(
                config=config,
                test_fraction=data["test_fraction"],
                split_mode=data["split_mode"],
                # Empty selection falls back to None (use all keypoints).
                keypoints_to_include=data.get("keypoints_to_include") or None,
                save_logs=True,
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/train", methods=["POST"])
class TrainModel(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(data, project_path, config):
            config["batch_size"] = data["batch_size"]
            config["max_epochs"] = data["max_epochs"]
            if data.get("learning_rate") is not None:
                config["learning_rate"] = float(data["learning_rate"])
            # Cap batches per epoch (decouples epoch length from dataset size);
            # blank/0 => use the whole dataset each epoch (VAME default).
            steps = data.get("steps_per_epoch")
            config["steps_per_epoch"] = int(steps) if steps else None
            # Optional per-run seed override; persisted with the config below.
            seed = data.get("project_random_state")
            if seed is not None:
                config["project_random_state"] = int(seed)
            # Continue from the previously trained model (load saved weights) when
            # requested; otherwise train from scratch. VAME loads weights only if
            # pretrained_weights is true and pretrained_model names the saved model
            # (best_model is "{model_name}_{project}.pkl").
            if data.get("continue_training"):
                config["pretrained_weights"] = True
                config["pretrained_model"] = config["model_name"]
            else:
                config["pretrained_weights"] = False
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            try:
                vame.train_model(config=config, save_logs=True)
            except KeyboardInterrupt:
                # User requested a stop; VAME already recorded "aborted" and saved
                # the current weights. Fall through to plot whatever completed.
                pass
            # Generate the loss figure from the epochs that ran (works for both
            # completed and aborted runs); never let it mask the training result.
            try:
                vame.visualization.plot_loss(
                    config=config,
                    model_name=config["model_name"],
                    save_to_file=True,
                    show_figure=False,
                )
            except Exception:
                pass

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            # Reject a run that could never save a model before it burns epochs.
            too_few_epochs = check_max_epochs(config, data.get("max_epochs"))
            if too_few_epochs:
                return {"message": too_few_epochs}, 400
            thread = threading.Thread(
                target=background_task, args=(data, project_path, config)
            )
            thread.start()
            time.sleep(2)  # Give the thread a moment to start
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/train/stop", methods=["POST"])
class StopTrainModel(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        """Request a graceful stop of an in-progress training.

        Writes VAME's stop sentinel via ``vame.stop_training``; the training loop
        notices it at the next epoch boundary, saves the current model, and
        records the ``aborted`` state (which the UI polls for).
        """
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            was_running = vame.stop_training(config=config)
            return {"status": "stop_requested", "was_running": bool(was_running)}
        except Exception as exception:
            # Clean JSON error (flask-restx's api.abort 500s with flask-cors here).
            return {"message": str(exception)}, 500


@api.route("/evaluate", methods=["POST"])
class EvaluateModel(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))

            model_name = config["model_name"]
            project_name = config["project_name"]
            best_model = (
                Path(project_path)
                / "model"
                / "best_model"
                / f"{model_name}_{project_name}.pkl"
            )
            if not best_model.exists():
                api.abort(
                    400,
                    "No trained model was found "
                    f"('{best_model.name}' is missing). Training likely ran for too "
                    "few epochs to save a best model — the model is only saved once "
                    "KL annealing completes (around epoch kl_start + annealtime). "
                    "Increase 'max_epochs' (or lower 'annealtime'/'kl_start') and "
                    "re-run training.",
                )

            vame.evaluate_model(
                config=config,
                save_logs=True,
            )
            return dict(result="success")
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/train-metrics", methods=["POST"])
class TrainMetrics(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        """Live training-loss figures (Plotly specs) from TensorBoard logs.

        Body: ``{"project": "<path>", "model_name"?: "<name>"}``. Returns
        ``{"epoch_train", "epoch_test", "batch", "has_data", "model_name"}``;
        safe to poll during training and before any events exist.
        """
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            model_name = data.get("model_name") or config["model_name"]
            return jsonify(build_training_figures(project_path, model_name))
        except Exception as exception:
            # Clean JSON error (flask-restx's api.abort 500s with flask-cors here).
            return {"message": str(exception)}, 500


@api.route("/model-images", methods=["POST"])
class ModelImages(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            model_name = config["model_name"]
            images_path = Path(project_path) / "model" / "evaluate"
            images_content = dict()
            if (images_path / f"mse_and_kl_loss_{model_name}.png").exists():
                with open(
                    images_path / f"mse_and_kl_loss_{model_name}.png", "rb"
                ) as image_file:
                    images_content["mse_and_kl_loss"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")
            if (images_path / "future_reconstruction.png").exists():
                with open(
                    images_path / "future_reconstruction.png", "rb"
                ) as image_file:
                    images_content["future_reconstruction"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")

            return jsonify(images_content)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
