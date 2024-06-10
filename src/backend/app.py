import os
import yaml
import json
from pathlib import Path

import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource

import matplotlib
matplotlib.use('Agg')  # Non-interactive matplotlib backend

VAME_APP_DIRECTORY = Path.home() / 'vame-desktop'

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

api = Api(
    app,
    version='1.0',
    title='VAME API',
    description="The REST API for VAME.",
)

@api.errorhandler(Exception)
def exception_handler(error):
    exceptiondata = traceback.format_exception(type(error), error, error.__traceback__)
    return {"message": exceptiondata[-1], "traceback": "".join(exceptiondata)}


def notBadRequestException(exception):
    """
    Check if the exception is a generic exception.
    """
    return type(exception).__name__ not in ["BadRequest", "Forbidden", "Unauthorized"]

def get_project_path(
        project: str,
        working_directory: str = None
    ):

    from datetime import datetime as dt
    date = dt.today()
    month = date.strftime("%B")
    day = date.day
    year = date.year
    d = str(month[0:3]+str(day))
    date = dt.today().strftime('%Y-%m-%d')

    if working_directory == None:
        working_directory = '.'

    wd = Path(working_directory).resolve()
    project_name = '{pn}-{date}'.format(pn=project, date=d+'-'+str(year))
    return wd / project_name

def resolve_request_data(request):
    data = json.loads(request.data) if request.data else {}
    project_path = Path( data.pop("project") if "project" in data else Path(data["config"].parent) )
    data["config"] = project_path / 'config.yaml' if "config" not in data else data["config"]
    return data, project_path


def get_evaluation_images(project_path):
    evaluation_output = project_path / 'model' / 'evaluate'
    png_files = list(evaluation_output.glob('*.png'))
    return [ str(png_file.relative_to(VAME_APP_DIRECTORY)) for png_file in png_files ]


@api.route('/connected')
class Connected(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        return jsonify({ "payload": True })


@api.route('/ready')
class Preload(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        import vame
        return { "payload": True }
    

@api.route('/files/<path:project>/<path:path>')
class Files(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self, project, path):
        from flask import send_from_directory
        return send_from_directory(VAME_APP_DIRECTORY, Path(project) / path)
    
@api.route('/pipelines')
class Files(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        pipelines = [str(pipeline) for pipeline in VAME_APP_DIRECTORY.glob('*') if pipeline.is_dir()]
        return jsonify(pipelines)


@api.route('/load')
class Load(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):

        _, project_path = resolve_request_data(request)
        config_path = project_path / "config.yaml"

        # Create a symlink to the project directory if it isn't in the VAME_APP_DIRECTORY
        if project_path.parent != VAME_APP_DIRECTORY:
            symlink = VAME_APP_DIRECTORY / project_path.name
            if not symlink.exists():
                symlink.symlink_to(project_path)

        images = dict(
            evaluation=get_evaluation_images(project_path)
        )

        return jsonify(dict(
            project=str(config_path.parent),
            config=yaml.safe_load(open(config_path, "r")) if config_path.exists() else None,
            images=images
        ))

@api.route('/create', methods=['POST'])
class Create(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:

            data = json.loads(request.data) if request.data else {}

            project_path = get_project_path(data["project"], VAME_APP_DIRECTORY)

            created = not project_path.exists()

            config_path = Path(vame.init_new_project(
                working_directory=VAME_APP_DIRECTORY,
                **data
            ))

            return jsonify(dict(
                project=str(config_path.parent),
                created=created,
                config=yaml.safe_load(open(config_path, "r"))
            ))

        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/delete_project', methods=['POST'])
class DeleteProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)

            if project_path.exists():
                import shutil
                shutil.rmtree(project_path, ignore_errors=True)
                return jsonify(dict(project=str(project_path), deleted=True))

            return jsonify(dict(project=str(project_path), deleted=False))

        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))


@api.route('/configure', methods=['POST'])
class ConfigureProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        from vame.util import auxiliary

        try:
            data, project_path = resolve_request_data(request)
            config_path = project_path / "config.yaml"

            if config_path.exists():
                with open(config_path, "r") as file:
                    config = yaml.safe_load(file)
                    config_update = data["config"]

                    if config_update:
                        config.update(config_update)
                        auxiliary.write_config(config_path, config)

                    return jsonify(dict(config=config))

            return jsonify(dict(config=None))

        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/update', methods=['POST'])
class UpdateConfig(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            config = project_path / 'config.yaml'

            if config.exists():
                config.rename(config.with_name(f"{config.stem}_backup{config.suffix}"))

            result = vame.update_config(config, force_update=True)

            return jsonify(dict(result = result ))

        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/align', methods=['POST'])
class Align(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:

            data, project_path = resolve_request_data(request)

            # If your experiment is by design egocentrical (e.g. head-fixed experiment on treadmill etc)
            # you can use the following to convert your .csv to a .npy array, ready to train vame on it
            egocentric_data = data.pop('egocentric_data')
            if egocentric_data:
                vame.csv_to_numpy(project_path / 'config.yaml')
            else:
                vame.egocentric_alignment(**data)


            return jsonify(dict(result='success'))

        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))


@api.route("/create_trainset")
class CreateTrainset(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.create_trainset(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/train', methods=['POST'])
class TrainModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.train_model(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/evaluate', methods=['POST'])
class EvaluateModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            vame.evaluate_model(**data)
            return dict(result=get_evaluation_images(project_path))
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/segment', methods=['POST'])
class Segment(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.pose_segmentation(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/motif_videos', methods=['POST'])
class MotifVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.motif_videos(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/community', methods=['POST'])
class Community(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/community_videos', methods=['POST'])
class CommunityVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community_videos(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/visualization', methods=['POST'])
class Visualization(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            result = vame.visualization(**data)
            return dict(result=result)
        except Exception as exception:
            if notBadRequestException(exception):
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
            if notBadRequestException(exception):
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
            if notBadRequestException(exception):
                api.abort(500, str(exception))

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    print(f"Running on {HOST}:{PORT}")
    app.run(host=HOST, port = PORT)
