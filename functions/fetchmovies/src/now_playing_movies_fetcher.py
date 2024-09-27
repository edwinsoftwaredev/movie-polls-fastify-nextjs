import asyncio
from datetime import date

import httpx

from .movie_details_fetcher import fetch_movie_details


async def fetch_now_playing_movies(
    tmdb_url: str,
    tmdb_key: str,
    client: httpx.AsyncClient,
    cached_movies,
):
    now = date.today()

    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    params["sort_by"] = "primary_release_date.desc"
    params["page"] = "1"
    params["primary_release_date.lte"] = now.isoformat()
    params["vote_average.gte"] = "1"
    params["vote_count.gte"] = "50"
    params["include_adult"] = "false"

    movies = await client.get(f"{tmdb_url}/discover/movie", params=params)
    movies = movies.json()["results"]

    # use asyncio.gather to maintain the same order of the aws (tmdb API results)
    movies = await asyncio.gather(
        *[
            fetch_movie_details(
                tmdb_url,
                params["api_key"],
                movie,
                client,
                cached_movies,
            )
            for movie in movies
        ],
        return_exceptions=True,
    )

    return [movie for movie in movies if not isinstance(movie, BaseException)]
