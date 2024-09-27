import os

import flask
import flask.typing
import functions_framework
import httpx


@functions_framework.http
def fn(request: flask.Request):
    httpx.get(os.getenv("RATE_LIMITER_URL", ""))

    inngest_app = flask.Flask("inngest_app")

    with inngest_app.app_context():
        import inngest_fn
        return inngest_fn.create_app()
