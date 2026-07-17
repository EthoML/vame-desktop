from pathlib import Path


def log_file(project: Path, log_name: str):
    log_path = Path(project) / "logs" / f"{log_name}.log"
    if log_path.is_file():
        log = open(log_path, "r").read()
        return log
    else:
        raise BaseException("Not found.")
