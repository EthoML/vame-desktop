from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from logging.config import dictConfig

def create_app():
    app = Flask("VAME API")
    CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    dictConfig({
        'version': 1,
        'formatters': {'default': {
            'format': '%(message)s',
        }},
        'handlers': {'wsgi': {
            'class': 'logging.StreamHandler',
            'stream': 'ext://sys.stdout',
            'formatter': 'default'
        }},
        'root': {
            'level': 'INFO',
            'handlers': ['wsgi']
        }
    })
  
    api = Api(app, version='2.0', title='VAME API', description="The REST API for VAME.")

    from app.routes import project, file, health_check, vame

    api.add_namespace(health_check.api)
    api.add_namespace(file.api)
    api.add_namespace(project.api)
    api.add_namespace(vame.api)

    return app


