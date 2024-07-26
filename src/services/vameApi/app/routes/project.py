from flask_restx import Resource
from flask import request, jsonify
from pathlib import Path
import json
from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.services.project_service import get_projects, get_recent_projects, is_project_ready, register_recent_projetc, load_project, create_project,delete_project, configure_project

from app.utils.not_bad_request_exception import not_bad_request_exception

@api.route('/projects')
class Projects(Resource):
    def get(self):
        projects = get_projects()
        return jsonify(projects)
    
@api.route('/projects/recent')
class RecentProjects(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def get(self):
        recent_projects = get_recent_projects()
        return jsonify(recent_projects)

@api.route('/project_ready')
class ProjectReady(Resource):
    def post(self):
        _, project_path = resolve_request_data(request)
        return jsonify(is_project_ready(project_path))
    
@api.route('/project/register')
class RegisterProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            _, project_path = resolve_request_data(request)
            return register_recent_projetc(project_path)

        except Exception as exception:
            # TODO: Should lock access to the file
            pass

@api.route('/create', methods=['POST'])
class Create(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data = json.loads(request.data) if request.data else {}

            project = create_project(data)

            return jsonify(project)

        except Exception as exception:
            print("exception", exception)
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

@api.route('/delete_project', methods=['POST'])
class DeleteProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            _, project_path = resolve_request_data(request)
            res = delete_project(project_path)
            return jsonify(res)

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/configure', methods=['POST'])
class ConfigureProject(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            configuration = configure_project(data, project_path)

            return jsonify(configuration)

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

    
@api.route('/load')
class Load(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        _, project_path = resolve_request_data(request)

        loaded_project = load_project(Path(project_path))
        return jsonify(loaded_project)