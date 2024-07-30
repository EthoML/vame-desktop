from flask_restx import Namespace
import traceback
from flask import jsonify

api = Namespace('/', description='Main API Namespace')

@api.errorhandler(Exception)
def exception_handler(error):
    exception_data = traceback.format_exception(type(error), error, error.__traceback__)
    response = {
        "message": exception_data[-1].strip(),
        "traceback": "".join(exception_data)
    }
    return jsonify(response), 500