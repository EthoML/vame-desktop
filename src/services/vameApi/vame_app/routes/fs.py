"""Server-side filesystem browsing API.

Backs the in-app (react-arborist) file browser. Everything is confined to
``DATA_ROOT`` (default: the user's home directory) so the same code is safe
whether the backend runs on the user's own machine or on a shared/remote server
(where ``VAME_DATA_ROOT`` should be set to a restricted directory).
"""

from pathlib import Path

from flask import request, jsonify
from flask_restx import Resource

from . import api
from vame_app.config import get_data_root, VAME_PROJECTS_DIRECTORY, resolve_within
from vame_app.utils.not_bad_request_exception import not_bad_request_exception


def _entry(path: Path) -> dict:
    is_dir = path.is_dir()
    info = {"name": path.name, "path": str(path), "is_dir": is_dir}
    if not is_dir:
        try:
            info["size"] = path.stat().st_size
        except OSError:
            info["size"] = None
    return info


@api.route("/fs/roots", methods=["GET"])
class FilesystemRoots(Resource):
    @api.doc(responses={200: "Success", 500: "Internal server error"})
    def get(self):
        """Entry points the browser can start from (confined to DATA_ROOT)."""
        try:
            data_root = get_data_root()
            roots = [{"name": "Home / Data root", "path": str(data_root)}]
            # Surface the VAME projects directory too, when it is inside DATA_ROOT.
            try:
                resolve_within(data_root, VAME_PROJECTS_DIRECTORY)
                if VAME_PROJECTS_DIRECTORY.exists():
                    roots.append(
                        {"name": "VAME projects", "path": str(VAME_PROJECTS_DIRECTORY)}
                    )
            except PermissionError:
                pass
            return jsonify({"roots": roots, "data_root": str(data_root)})
        except Exception as exception:
            # Return clean JSON (not api.abort) so the SPA shows the message
            # instead of an opaque 500 HTML page.
            return {"message": str(exception)}, 500


@api.route("/fs/list", methods=["GET"])
class FilesystemList(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def get(self):
        """List directories/files under ``path`` (defaults to DATA_ROOT).

        Optional query params:
          - ``path``: directory to list (jailed to DATA_ROOT).
          - ``exts``: comma-separated extensions to keep (e.g. ``.csv,.mp4``).
                      Directories are always returned so the user can navigate.
          - ``show_hidden``: ``true`` to include dotfiles (default: false).
        """
        data_root = get_data_root()
        raw_path = request.args.get("path") or str(data_root)
        exts_param = request.args.get("exts", "")
        show_hidden = request.args.get("show_hidden", "false").lower() == "true"
        exts = {e.strip().lower() for e in exts_param.split(",") if e.strip()}

        # All error paths below return clean JSON ({"message": ...}, code)
        try:
            target = resolve_within(data_root, raw_path)
        except PermissionError as exception:
            return {"message": str(exception)}, 400

        try:
            if not target.is_dir():
                return {"message": f"Not a directory: '{target}'"}, 400

            dirs, files = [], []
            for child in sorted(
                target.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())
            ):
                if child.name.startswith(".") and not show_hidden:
                    continue
                try:
                    is_dir = child.is_dir()
                except OSError:
                    continue
                if is_dir:
                    dirs.append(_entry(child))
                else:
                    if exts and child.suffix.lower() not in exts:
                        continue
                    files.append(_entry(child))

            parent = None
            if target != data_root and data_root in target.parents:
                parent = str(target.parent)

            return jsonify(
                {
                    "path": str(target),
                    "parent": parent,
                    "is_root": target == data_root,
                    "entries": dirs + files,
                }
            )
        except PermissionError:
            api.abort(400, f"Permission denied: '{target}'")
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
