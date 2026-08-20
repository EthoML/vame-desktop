from flask_restx import Namespace, Resource
from flask import send_from_directory, request
from vame_app.services.file_service import log_file
from vame_app.config import VAME_PROJECTS_DIRECTORY
from pathlib import Path

api = Namespace("files", description="Project file and log serving", path="/")


@api.route("/files/<path:project>/<path:path>")
class Files(Resource):
    def get(self, project, path):
        # URL components, not filesystem paths: send_from_directory requires "/"
        # separators and rejects the "\" a Path would produce on Windows.
        return send_from_directory(VAME_PROJECTS_DIRECTORY, f"{project}/{path}")


@api.route("/log/<path:log_name>")
class ProjectLog(Resource):
    @api.doc(
        responses={
            200: "Success",
            400: "Bad Request",
            404: "Not found",
            500: "Internal server error",
        }
    )
    def get(self, log_name):
        project_path = request.args.get("project")
        project_path = Path(project_path)
        try:
            if log_name:
                return log_file(project_path, log_name)
            else:
                return "missing log_name", 400
        except:
            return f"{log_name} log not found.", 404
