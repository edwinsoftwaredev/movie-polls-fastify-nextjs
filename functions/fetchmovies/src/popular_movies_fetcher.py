import asyncio
from datetime import date, timedelta
from itertools import islice
from operator import itemgetter

import httpx

from .movie_details_fetcher import fetch_movie_details


async def fetch_top_popular_movies(
    tmdb_url: str,
    tmdb_key: str,
    client: httpx.AsyncClient,
    cached_movies,
):
    now = date.today()
    from_date = now - timedelta(days=365)

    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    params["sort_by"] = "vote_average.desc"
    params["page"] = "1"
    params["primary_release_date.gte"] = from_date.isoformat()
    params["vote_average.gte"] = "7"
    params["vote_count.gte"] = "1000"
    params["include_adult"] = "false"

    movies = await client.get(f"{tmdb_url}/discover/movie", params=params)
    movies = movies.json()["results"]

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

    movies = (movie for movie in movies if not isinstance(movie, BaseException))

    movies = sorted(
        islice(sorted(movies, key=itemgetter("vote_count"), reverse=True), 0, 10),
        key=itemgetter("vote_average"),
        reverse=True,
    )

    return movies


async def fetch_popular_movies_by_genre_and_decade(
    tmdb_url: str,
    tmdb_key: str,
    decade_start: int,
    genre,
    client: httpx.AsyncClient,
    cached_movies,
    state,
):
    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    params["sort_by"] = "vote_average.desc"
    params["page"] = "1"
    params["primary_release_date.gte"] = f"{decade_start}-01-01"
    params["primary_release_date.lte"] = f"{decade_start + 9}-12-31"
    params["vote_count.gte"] = "500"
    params["include_adult"] = "false"
    params["with_genres"] = genre["id"]

    movies = await client.get(f"{tmdb_url}/discover/movie", params=params)
    movies = movies.json()["results"]

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

    movies = [movie for movie in movies if not isinstance(movie, BaseException)]

    if len(movies):
        state[decade_start].append({"genre_name": genre["name"], "results": movies})
