from flask import jsonify
from pathlib import Path
from app.config import VAME_PROJECTS_DIRECTORY

def check_file_exists(project: Path, path: str):
  full_path = VAME_PROJECTS_DIRECTORY / project / path
  return jsonify(dict(exists=full_path.exists()))

def log_file(project: Path, log_name: str):
  log_path = Path(project) / "logs" / f"{log_name}.log"
  if log_path.is_file():
    log = open(log_path, "r").read()
    return log
  else:
    raise BaseException("Not found.")