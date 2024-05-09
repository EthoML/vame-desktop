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

@app.route('/align', methods=['POST'])
@cross_origin()
def egocentric_alignment():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.egocentric_alignment(**data)

    # # If your experiment is by design egocentrical (e.g. head-fixed experiment on treadmill etc) 
    # # you can use the following to convert your .csv to a .npy array, ready to train vame on it
    # vame.csv_to_numpy(config)

    return jsonify(config)


@app.route('/create', methods=['POST'])
@cross_origin()
def create_trainset():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.create_trainset(**data)
    return jsonify(config)

@app.route('/train', methods=['POST'])
@cross_origin()
def train_model():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.train_model(**data)
    return jsonify(config)

@app.route('/evaluate', methods=['POST'])
@cross_origin()
def evaluate_model():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.evaluate_model(**data)
    return jsonify(config)

@app.route('/segment', methods=['POST'])
@cross_origin()
def pose_segmentation():
    import vame
    data = json.loads(request.data) if request.data else {}
    config = vame.pose_segmentation(**data)
    return jsonify(config)

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8080
    HOST = os.getenv('HOST') or 'localhost'
    print(f"Running on {HOST}:{PORT}")
    app.run(host=HOST, port = PORT)
