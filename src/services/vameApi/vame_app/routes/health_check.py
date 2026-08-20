from flask_restx import Namespace, Resource

api = Namespace("health", description="Liveness and readiness checks", path="/")


@api.route("/connected")
class Connected(Resource):
    def get(self):
        return {"payload": True}


@api.route("/ready")
class VAMEReady(Resource):
    def get(self):
        import vame

        return {"payload": True}
