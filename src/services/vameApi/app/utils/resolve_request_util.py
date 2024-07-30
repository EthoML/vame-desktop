import json
from pathlib import Path

def resolve_request_data(request):
    data = json.loads(request.data) if request.data else {}
    project_path = Path(data.pop("project") if "project" in data else Path(data["config"].parent))
    data["config"] = str(project_path / 'config.yaml') if "config" not in data else data["config"]
    return data, project_path
