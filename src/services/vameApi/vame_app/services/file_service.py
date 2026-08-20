from pathlib import Path

# Cap how much of a log we return per request.
_TAIL_BYTES = 256 * 1024


def log_file(project: Path, log_name: str):
    log_path = Path(project) / "logs" / f"{log_name}.log"
    if not log_path.is_file():
        raise BaseException("Not found.")
    size = log_path.stat().st_size
    with open(log_path, "rb") as f:
        if size > _TAIL_BYTES:
            f.seek(size - _TAIL_BYTES)
            f.readline()  # discard the partial first line so we start on a boundary
        data = f.read()
    return data.decode("utf-8", errors="replace")
