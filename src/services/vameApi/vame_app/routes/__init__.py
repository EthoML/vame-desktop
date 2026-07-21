"""Route modules.

Each module owns a distinct flask-restx Namespace, declared with ``path="/"``
so its routes stay at the root (the frontend calls them unprefixed).
"""

import traceback

from werkzeug.exceptions import HTTPException


def register_exception_handler(api):
    """Return 500 with the traceback for any otherwise-unhandled exception."""

    @api.errorhandler(Exception)
    def exception_handler(error):
        # abort() raises an HTTPException, which is also an Exception and so
        # matches this handler. Return its own status rather than masking every
        # client error as a 500.
        if isinstance(error, HTTPException):
            return {"message": error.description}, error.code or 500

        exception_data = traceback.format_exception(
            type(error), error, error.__traceback__
        )
        response = {
            "message": exception_data[-1].strip(),
            "traceback": "".join(exception_data),
        }
        return response, 500
