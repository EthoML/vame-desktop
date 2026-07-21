"""The error contract: abort() keeps its status, unhandled errors give a traceback."""

from flask import Flask
from flask_restx import Api, Namespace, Resource

from vame_app.routes import register_exception_handler


def _client():
    app = Flask("test")
    api = Api(app)
    register_exception_handler(api)

    ns = Namespace("probe", path="/")

    @ns.route("/bad-request")
    class BadRequest(Resource):
        def get(self):
            ns.abort(400, "bad input")

    @ns.route("/missing")
    class Missing(Resource):
        def get(self):
            ns.abort(404, "nope")

    @ns.route("/server-error")
    class ServerError(Resource):
        def get(self):
            ns.abort(500, "server side")

    @ns.route("/boom")
    class Boom(Resource):
        def get(self):
            raise RuntimeError("kaboom")

    api.add_namespace(ns)
    return app.test_client()


def test_abort_keeps_its_status_code():
    client = _client()
    assert client.get("/bad-request").status_code == 400
    assert client.get("/missing").status_code == 404
    assert client.get("/server-error").status_code == 500


def test_abort_message_reaches_the_client():
    # The frontend surfaces body["message"] verbatim.
    body = _client().get("/bad-request").get_json()
    assert body["message"] == "bad input"


def test_unhandled_exception_returns_500_with_traceback():
    response = _client().get("/boom")
    body = response.get_json()
    assert response.status_code == 500
    assert body["message"] == "RuntimeError: kaboom"
    assert "RuntimeError: kaboom" in body["traceback"]
