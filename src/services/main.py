import sys
import os
import yaml
import json
import csv
from pathlib import Path
import sys
import signal
from logging.config import dictConfig

import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource

# Type hinting
from typing import Union

# Logging dependencies
import queue
import threading
from datetime import datetime

# Plotting configuration
import matplotlib
matplotlib.use('Agg')  # Non-interactive matplotlib backend

FILES_TO_IGNORE = [ '.DS_Store' ]

def get_files(folder_to_search):
    folder_to_search = Path(folder_to_search)
    ignore_glob = set(FILES_TO_IGNORE)
    return [ file for file in folder_to_search.glob('*') if file.is_file() and file.name not in ignore_glob ] 

    # Queue to hold stdout messages
    log_queue = queue.Queue()

    # Save the original stdout
    original_stdout = sys.stdout
    original_stderr = sys.stderr

    # Custom stream handler to put stdout into the queue and print to console
    class QueueStream:
        def __init__(self, q, stream):
            self.q = q
            self.stream = stream

        def write(self, msg):
            if isinstance(msg, bytes):
                msg = msg.decode('utf-8')  # Decode bytes to string if necessary
            if msg.strip():  # Avoid writing empty messages
                self.q.put(msg)
                self.stream.write(msg)  # Print to console

        def flush(self):
            self.stream.flush()

    # Logging thread function
    def log_writer(q, log_file):
        with open(log_file, 'a') as f:
            while True:
                msg = q.get()
                if msg == 'STOP':  # Stop signal for the thread
                    break
                f.write(msg)
                f.flush()

    # Redirect stdout to the queue and console
    sys.stdout = QueueStream(log_queue, original_stdout)
    sys.stderr = QueueStream(log_queue, original_stderr)

    # Start the logging thread
    log_thread = threading.Thread(target=log_writer, args=(log_queue, log_file))
    log_thread.start()

    def close():
        # Stop the logging thread
        log_queue.put('STOP')
        log_thread.join()

        # Reset stdout and stderr
        sys.stdout = original_stdout
        sys.stderr = original_stderr

    return dict(
        close=close
    )

VAME_APP_DIRECTORY = Path.home() / 'vame-desktop'
VAME_PROJECTS_DIRECTORY = VAME_APP_DIRECTORY / 'projects'
VAME_LOG_DIRECTORY = VAME_APP_DIRECTORY / 'logs'
GLOBAL_SETTINGS_FILE = VAME_APP_DIRECTORY / 'settings.json'
GLOBAL_STATES_FILE = VAME_APP_DIRECTORY / 'states.json'

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '%(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://sys.stdout',  # <-- Solution
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

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

    date = datetime.today()
    month = date.strftime("%B")
    day = date.day
    year = date.year
    d = str(month[0:3]+str(day))
    date = datetime.today().strftime('%Y-%m-%d')

    if working_directory == None:
        working_directory = '.'

    wd = Path(working_directory).resolve()
    project_name = '{pn}-{date}'.format(pn=project, date=d+'-'+str(year))
    return wd / project_name

def resolve_request_data(request):
    data = json.loads(request.data) if request.data else {}
    project_path = Path( data.pop("project") if "project" in data else Path(data["config"].parent) )
    data["config"] = str(project_path / 'config.yaml') if "config" not in data else data["config"]
    return data, project_path


def get_evaluation_images(project_path):
    evaluation_output = project_path / 'model' / 'evaluate'
    png_files = list(evaluation_output.glob('*.png'))
    return [ str(png_file.relative_to(project_path)) for png_file in png_files ]


def get_visualization_images(project_path):
    community_subfolders = get_video_related_asset(
        project_path, 
        subpath='community',
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
        asset_path = results_location / video_set / model_name / 'hmm-15' / video_set_subpath
        video_related_assets[video_set] = asset_path if return_path else str(asset_path)
        if validate and not asset_path.exists():
            video_related_assets[video_set] = None

    return video_related_assets

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


def get_motif_videos(project_path):
    return get_videos(project_path, 'cluster_videos')

def get_community_videos(project_path):
    return get_videos(project_path, 'community_videos')

def get_pose_ref_index_description(csv_file_path: str) -> str:
    with open(csv_file_path) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        body_parts = []
    
        # loop to iterate through the rows of csv
        for row in csv_reader:
            if row[0] == "bodyparts":
                body_parts = list(dict.fromkeys(row[1:]))  # Extract body parts starting from the second element and remove duplicates
                break
        
        if len(body_parts) == 0:
            print("No body parts headers found in CSV.")
            return ""
        
        # Create the string based on body parts
        body_parts_string = ", ".join([f"{i}-{part}" for i, part in enumerate(body_parts)])
        
    return body_parts_string


@api.route('/connected')
class Connected(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        return jsonify({ "payload": True })


@api.route('/ready')
class VAMEReady(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        import vame
        return jsonify({ "payload": True })
    
@api.route('/settings')
class Settings(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        return json.loads(open(GLOBAL_SETTINGS_FILE, "r").read())

        
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        data = json.loads(request.data) if request.data else {}
        with open(GLOBAL_SETTINGS_FILE, "w") as file:
            json.dump(data, file)
        return jsonify(data)

@api.route('/files/<path:project>/<path:path>')
class Files(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self, project, path):
        from flask import send_from_directory
        return send_from_directory(VAME_PROJECTS_DIRECTORY, Path(project) / path)
    

@api.route('/exists/<path:project>/<path:path>')
class FileExists(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self, project, path):
        full_path = VAME_PROJECTS_DIRECTORY / project / path
        return jsonify(dict(exists=full_path.exists()))
    
    
@api.route('/projects')
class Projects(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        projects = [ str(project) for project in VAME_PROJECTS_DIRECTORY.glob('*') if project.is_dir() ]
        return jsonify(projects)
    
@api.route('/projects/recent')
class RecentProjects(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        with open(GLOBAL_STATES_FILE, "r") as inp:
            states = json.load(fp=inp)
        # states = json.loads(open(GLOBAL_STATES_FILE, "r").read())
        recent_projects = states.get("recent_projects", [])

        # Filter those that no longer exist
        recent_projects = [ str(project) for project in recent_projects if (VAME_PROJECTS_DIRECTORY / project).exists() ]
        states["recent_projects"] = recent_projects
        with open(GLOBAL_STATES_FILE, "w") as file:
            json.dump(states, file)

        return jsonify(recent_projects)
    
@api.route('/project/register')
class RegisterProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):

        try:
            with open(GLOBAL_STATES_FILE, "r") as inp:
                states = json.load(fp=inp)

            recent_projects = states.get("recent_projects", [])

            _, project_path = resolve_request_data(request)

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

            return jsonify(recent_projects)
        
        except Exception as exception:
            # NOTE: Should lock access to the file
            pass

@api.route('/log/<path:log_name>')
class ProjectLog(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request",404: "Not found", 500: "Internal server error"})
    def get(self, log_name):

        project_path = request.args.get('project')
        project_path = Path(project_path)

        if(log_name):
            log_path = Path(project_path) / "logs" / f"{log_name}.log"
            if log_path.is_file():
                log = open(log_path, "r").read()
                return log
            else:
                return f"{log_name} log not found.", 404

        return "missing log_name", 400

@api.route('/load')
class Load(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):

        _, project_path = resolve_request_data(request)
        config_path = project_path / "config.yaml"

        # Create a symlink to the project directory if it isn't in the VAME_PROJECTS_DIRECTORY
        if project_path.parent != VAME_PROJECTS_DIRECTORY:
            symlink = VAME_PROJECTS_DIRECTORY / project_path.name
            if not symlink.exists():
                symlink.symlink_to(project_path)

        states_path = Path(project_path) / "states" / "states.json"

        states = json.load(open(states_path)) if os.path.exists(states_path) else None

        config = yaml.safe_load(open(config_path, "r")) if config_path.exists() else None

        images = dict(
            evaluation=get_evaluation_images(project_path),
            visualization=get_visualization_images(project_path)
        )

        videos = dict(
            motif=get_motif_videos(project_path),
            community=get_community_videos(project_path)
        )

        has_latent_vector_files = False
        if config:
            has_latent_vector_files = all(map(lambda video: (get_video_results_path(video, project_path) / f"latent_vector_{video}.npy").exists(), config["video_sets"]))

        has_communities = (project_path / 'cohort_community_label.npy').exists()

        original_videos_location = project_path / 'videos'
        original_csvs_location = original_videos_location / 'pose_estimation'

        # Get all files in the original data directory
        original_videos = list(map(lambda file: str(file), get_files(original_videos_location)))
        original_csvs = list(map(lambda file: str(file), get_files(original_csvs_location)))

        # Provide project workflow status
        workflow = dict(
            organized = (project_path / 'data' / 'train').exists(),
            pose_ref_index_description=get_pose_ref_index_description(original_csvs[0]),
            modeled = len(images["evaluation"]) > 0,
            segmented = has_latent_vector_files,
            motif_videos_created = all(map(lambda videos: len(videos) > 0, videos["motif"].values())),
            communities_created = has_communities,
            community_videos_created = all(map(lambda videos: len(videos) > 0, videos["community"].values())),
            umaps_created = any(map(lambda videos: len(videos) > 0, images["visualization"].values())),
        )

        return jsonify(dict(
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
        ))

@api.route('/create', methods=['POST'])
class Create(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:

            data = json.loads(request.data) if request.data else {}

            project_path = get_project_path(data["project"], VAME_PROJECTS_DIRECTORY)

            created = not project_path.exists()

            config_path = Path(vame.init_new_project(
                working_directory=VAME_PROJECTS_DIRECTORY,
                **data
            ))

            return jsonify(dict(
                project=str(config_path.parent),
                created=created,
                config=yaml.safe_load(open(config_path, "r"))
            ))

        except Exception as exception:
            print("exception", exception)
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
            if notBadRequestException(exception):
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
            if notBadRequestException(exception):
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
            if notBadRequestException(exception):
                api.abort(500, str(exception))

@api.route('/evaluate', methods=['POST'])
class EvaluateModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        try:
            data, project_path = resolve_request_data(request)
            vame.evaluate_model(
                **data,
                save_logs=True
            )
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
            result = vame.pose_segmentation(
                **data,
                save_logs=True
            )
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
            result = vame.motif_videos(
                **data,
                save_logs=True
            )
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
            result = vame.community(
                **data,
                save_logs=True
            )
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
            result = vame.community_videos(
                **data,
                save_logs=True
            )
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
            vame.visualization(
                **data,
                save_logs=True
            )
            return dict(result=get_visualization_images(project_path))
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

def signal_handler(sig, frame):
    print('Received SIGTERM, shutting down...')
    os._exit(0)

signal.signal(signal.SIGTERM, signal_handler)

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    
    VAME_PROJECTS_DIRECTORY.mkdir(exist_ok=True, parents=True) # Create the VAME_PROJECTS_DIRECTORY if it doesn't exist
    VAME_LOG_DIRECTORY.mkdir(exist_ok=True, parents=True)  # Create the VAME_LOG_DIRECTORY if it doesn't exist

    # Create the global files if they don't exist
    global_files = [GLOBAL_STATES_FILE, GLOBAL_SETTINGS_FILE]
    for file in global_files:
        if not file.exists():
            with open(file, "w") as f:
                json.dump({}, f)
    
    # Run the app
    try:
        print(f"Running on {HOST}:{PORT}")
        app.run(host=HOST, port = PORT)

    except Exception as e:
        print(f"An error occurred that closed the server: {e}")
        raise e
