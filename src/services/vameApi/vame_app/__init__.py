import matplotlib

matplotlib.use("agg")

import os
from pathlib import Path
from logging.config import dictConfig

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_restx import Api

from vame_app.config import VAME_APP_DIRECTORY

# Directory holding the built React frontend (produced by `npm run build`).
WEB_DIR = Path(__file__).parent / "web"


def create_app():
    app = Flask("VAME API", instance_path=os.path.abspath(VAME_APP_DIRECTORY))

    # Same-origin in production (the frontend is served by this app). CORS is only
    # needed for the dev workflow where the Vite dev server proxies to us; keep it
    # scoped to localhost origins rather than wide-open.
    CORS(app, origins=["http://localhost:*", "http://127.0.0.1:*"])
    app.config["CORS_HEADERS"] = "Content-Type"

    dictConfig(
        {
            "version": 1,
            "formatters": {"default": {"format": "%(message)s"}},
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "formatter": "default",
                }
            },
            "root": {"level": "INFO", "handlers": ["wsgi"]},
        }
    )

    # Mount Swagger UI at /swagger so "/" is free to serve the SPA.
    api = Api(
        app,
        version="2.0",
        title="VAME API",
        description="The REST API for VAME.",
        doc="/swagger",
    )

    from vame_app.routes import (
        project,
        file,
        health_check,
        vame,
        preprocessing,
        model,
        pose_segmentation,
        community,
        report,
        gpu_check,
        fs,
    )

    api.add_namespace(health_check.api)
    api.add_namespace(file.api)
    api.add_namespace(project.api)
    api.add_namespace(vame.api)
    api.add_namespace(preprocessing.api)
    api.add_namespace(model.api)
    api.add_namespace(pose_segmentation.api)
    api.add_namespace(community.api)
    api.add_namespace(report.api)
    api.add_namespace(gpu_check.api)
    api.add_namespace(fs.api)

    _register_frontend(app)

    # Heal any pipeline steps left at "running" by a previous process. Every
    # long-running step runs in-process, so nothing survives a restart — any
    # lingering "running" state is stale and would otherwise show a perpetual
    # spinner in the UI. Never let this block startup.
    try:
        from vame_app.services.project_service import reconcile_stale_running_states

        healed = reconcile_stale_running_states()
        if healed:
            app.logger.warning(
                "Reset stale 'running' states on startup for: %s", ", ".join(healed)
            )
    except Exception as exc:  # noqa: BLE001 - startup must not fail on this
        app.logger.warning("Could not reconcile stale states on startup: %s", exc)

    return app


def _register_frontend(app: Flask):
    """Serve the built React SPA.

    The frontend uses a HashRouter, so the server only needs to serve static
    assets and fall back to index.html. The catch-all is the least specific rule
    in the URL map, so all API routes (e.g. /connected, /files/<...>, /fs/list)
    take precedence.

    Note: flask-restx registers its own "/" rule (``render_root``) that aborts
    404, so we override the existing "/" view rather than adding a second rule.
    """

    index_file = WEB_DIR / "index.html"

    def serve_index():
        if not index_file.is_file():
            return (
                "<h1>VAME App backend is running</h1>"
                "<p>The frontend has not been built. Run <code>npm run build</code> "
                "or use the Vite dev server (<code>npm run dev</code>).</p>",
                200,
            )
        return send_from_directory(WEB_DIR, "index.html")

    def serve_spa(filename):
        candidate = WEB_DIR / filename
        if candidate.is_file():
            return send_from_directory(WEB_DIR, filename)
        # Unknown path -> let the client-side router handle it.
        if index_file.is_file():
            return send_from_directory(WEB_DIR, "index.html")
        return "Not found", 404

    # Override flask-restx's existing "/" view (whatever endpoint it used)
    # instead of registering a conflicting second rule.
    root_endpoint = next(
        (r.endpoint for r in app.url_map.iter_rules() if r.rule == "/"), None
    )
    if root_endpoint is not None:
        app.view_functions[root_endpoint] = serve_index
    else:
        app.add_url_rule("/", "spa_index", serve_index)

    app.add_url_rule("/<path:filename>", "spa_catchall", serve_spa)
