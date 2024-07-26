from flask_restx import Resource
from . import api

@api.route('/connected')
class Connected(Resource):
    def get(self):
        return {"payload": True}

@api.route('/ready')
class VAMEReady(Resource):
    def get(self):
        import vame
        return {"payload": True}
