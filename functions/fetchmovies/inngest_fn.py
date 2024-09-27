import flask
import asyncio
from src.movie_fetcher import fetch_movies
import json


def create_app():
    import inngest.flask

    inngest_client = inngest.Inngest(app_id="Movie-Polls")

    @inngest_client.create_function(
        fn_id="fetch-movies-python",
        trigger=inngest.TriggerCron(cron="0 12 * * *"),
    )
    async def cron_fetch_movies(ctx: inngest.Context, step: inngest.Step):
        try:
            await fetch_movies()
            return json.dumps({"status": 200, "body": "done"})
        except Exception as e:
            return json.dumps({"status": 500, "body": e})

    inngest.flask.serve(
        flask.current_app,
        inngest_client,
        [cron_fetch_movies],
        serve_path="/fetch_movies_python",
    )

    return asyncio.run(flask.current_app.view_functions['inngest_api']())
