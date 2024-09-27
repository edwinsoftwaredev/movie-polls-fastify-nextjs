import asyncio
from datetime import date, timedelta
from itertools import islice
from operator import itemgetter

import httpx

from .app_types import Genre, MoviesByGenre
from .movie_details_fetcher import fetch_movie_details


async def fetch_trending_movies_by_genre(
    tmdb_url: str,
    tmdb_key: str,
    genre: Genre,
    client: httpx.AsyncClient,
    cached_movies,
) -> MoviesByGenre:
    now = date.today()
    from_date = now - timedelta(days=365)

    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    params["page"] = "1"
    params["include_adult"] = "false"
    params["sort_by"] = "popularity.desc"
    params["vote_average.gte"] = "1"
    params["vote_count.gte"] = "50"
    params["primary_release_date.gte"] = from_date.isoformat()
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

    return {"genre_name": genre["name"], "results": movies}


async def fetch_top_trending_movies(
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
    params["sort_by"] = "primary_release_date.desc"
    params["page"] = "1"
    params["primary_release_date.gte"] = from_date.isoformat()
    params["vote_average.gte"] = "7"
    params["vote_count.gte"] = "50"
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

    movies = sorted(islice(movies, 0, 10), key=itemgetter("vote_average"), reverse=True)

    return movies
