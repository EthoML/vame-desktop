from flask_restx import Resource
from flask import request, jsonify
from pathlib import Path
from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.get_assets import get_evaluation_images, get_visualization_images
from app.utils.not_bad_request_exception import not_bad_request_exception

@api.route('/align', methods=['POST'])
class Align(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:

            data, project_path = resolve_request_data(request)

            # If your experiment is by design egocentrical (e.g. head-fixed experiment on treadmill etc)
            # you can use the following to convert your .csv to a .npy array, ready to train vame on it
            egocentric_data = data.pop('egocentric_data', None)


            if egocentric_data:
                vame.csv_to_numpy(
                    project_path / 'config.yaml',
                    save_logs=True
                )

            else:
                vame.egocentric_alignment(
                    **data,
                    save_logs=True
                )


            return jsonify(dict(result='success'))

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/create_trainset")
class CreateTrainset(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)

            result = vame.create_trainset(
                **data,
                save_logs=True
            )

            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/train', methods=['POST'])
class TrainModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)

            result = vame.train_model(
                **data,
                save_logs=True
            )

            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/evaluate', methods=['POST'])
class EvaluateModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            vame.evaluate_model(
                **data,
                save_logs=True
            )
            return dict(result=get_evaluation_images(project_path))
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/segment', methods=['POST'])
class Segment(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.pose_segmentation(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/motif_videos', methods=['POST'])
class MotifVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.motif_videos(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/community', methods=['POST'])
class Community(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/community_videos', methods=['POST'])
class CommunityVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community_videos(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/visualization', methods=['POST'])
class Visualization(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            vame.visualization(
                **data,
                save_logs=True
            )
            return dict(result=get_visualization_images(project_path))
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/generative_model', methods=['POST'])
class GenerativeModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.generative_model(**data)
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/gif', methods=['POST'])
class CreateGif(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.gif(**data)
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
