import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/connected')
@cross_origin()
def isConnected():
    return { "payload": True }

@app.route('/initialize', methods=['POST'])
@cross_origin()
def post():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.init_new_project(**data)
    return jsonify(config)

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    print(f"Running on {HOST}:{PORT}")
    app.run(host=HOST, port = PORT)
