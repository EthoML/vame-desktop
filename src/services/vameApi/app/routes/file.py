from flask_restx import Resource
from flask import send_from_directory, request
from app.routes import api
from app.services.file_service import check_file_exists, log_file
from app.config import VAME_PROJECTS_DIRECTORY
from pathlib import Path

@api.route('/files/<path:project>/<path:path>')
class Files(Resource):
    def get(self, project, path):
        return send_from_directory(VAME_PROJECTS_DIRECTORY, Path(project) / path)

@api.route('/exists/<path:project>/<path:path>')
class FileExists(Resource):
    def get(self, project, path):
        return check_file_exists(Path(project), path)

@api.route('/log/<path:log_name>')
class ProjectLog(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request",404: "Not found", 500: "Internal server error"})
    def get(self, log_name):

        project_path = request.args.get('project')
        project_path = Path(project_path)

        try:
            if(log_name):
                return log_file(project_path, log_name)
            else:
                return "missing log_name", 400
        except:
                return f"{log_name} log not found.", 404

        

# Add other file-related routes here
