from pathlib import Path
import json
from flask_restx import Resource
from flask import request, jsonify
import vame
import xarray as xr

from . import api
from vame_app.utils.resolve_request_util import resolve_request_data
from vame_app.services.project_service import (
    get_projects,
    is_project_ready,
    register_project,
    load_project,
    validate_project,
    create_project,
    delete_project,
    configure_project,
)

from vame_app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/projects")
class Projects(Resource):
    def get(self):
        projects = get_projects()
        return jsonify(projects)


@api.route("/project_ready")
class ProjectReady(Resource):
    def post(self):
        _, project_path = resolve_request_data(request)
        try:
            return jsonify(is_project_ready(project_path))
        except Exception as exception:
            print("exception", exception)
            api.abort(500, str(exception))


@api.route("/project/validate", methods=["POST"])
class ValidateProject(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        """Gate an import: report whether a folder is a usable VAME project.

        Checked before the project is opened, so an incompatible one is never
        symlinked into the projects directory or added to the registry.
        """
        try:
            _, project_path = resolve_request_data(request)
            reason = validate_project(project_path)
            return jsonify(dict(valid=reason is None, reason=reason))
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/project/register")
class RegisterProject(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            _, project_path = resolve_request_data(request)
            return register_project(project_path)
        except Exception as exception:
            # TODO: Should lock access to the file
            print("exception", exception)
            api.abort(500, str(exception))


@api.route("/create", methods=["POST"])
class Create(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data = json.loads(request.data) if request.data else {}
            project = create_project(data)
            return jsonify(project)
        except Exception as exception:
            print("exception", exception)
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/delete_project", methods=["POST"])
class DeleteProject(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            _, project_path = resolve_request_data(request)
            res = delete_project(project_path)
            return jsonify(res)

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/configure", methods=["POST"])
class ConfigureProject(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            configuration = configure_project(data, project_path)
            return jsonify(configuration)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/project/state", methods=["POST"])
class StateProject(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            states = vame.read_states(config=config)
            return dict(states=states)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/load")
class Load(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        _, project_path = resolve_request_data(request)
        try:
            loaded_project = load_project(Path(project_path))
            return jsonify(loaded_project)
        except Exception as exception:
            print(exception)
            api.abort(500, str(exception))


@api.route("/project/raw-data", methods=["GET"])
class RawData(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def get(self):
        project_path = request.args.get("project")
        session = request.args.get("session")
        if not project_path or not session:
            api.abort(400, "Missing 'project' or 'session'")
        # Check the config exists up front so a stale/incomplete project path
        # yields a clear 404 instead of an opaque read_config FileNotFoundError.
        config_path = Path(project_path) / "config.yaml"
        if not config_path.exists():
            api.abort(404, f"Project config not found: '{config_path}'")
        try:
            config = vame.read_config(str(config_path))
            session_names = config.get("session_names", [])
            if session not in session_names:
                api.abort(400, f"Session '{session}' not found in project '{project_path}'")
            file_path = Path(project_path) / "data" / "raw" / f"{session}.nc"
            if not file_path.exists():
                api.abort(404, f"Raw data file not found: '{file_path}'")
            ds = xr.open_dataset(file_path)
            html = ds._repr_html_()
            return jsonify(html=html)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
