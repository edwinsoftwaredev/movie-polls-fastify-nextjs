import asyncio
import json
from datetime import date
from enum import Enum
from itertools import product
from operator import itemgetter
from typing import Dict, List

import flask
import httpx
from upstash_redis.asyncio import Redis

from .app_types import Genre, MoviesByGenre
from .genres_fetcher import fetch_genres
from .now_playing_movies_fetcher import fetch_now_playing_movies
from .popular_movies_fetcher import (
    fetch_popular_movies_by_genre_and_decade,
    fetch_top_popular_movies,
)
from .secret_fetcher import fetch_secrets
from .trending_movies_fetcher import (
    fetch_top_trending_movies,
    fetch_trending_movies_by_genre,
)

Movies_Type = Enum(
    "Movies_Type",
    [
        "TopPopularMovies",
        "TopTrendingMovies",
        "NowPlayingMovies",
        "TrendingMoviesByGenre",
    ],
)


async def fetch_movies():
    secrets = fetch_secrets()

    redis_connection_string = secrets.get("UPSTASH_REDIS_REST_URL")
    redis_connection_token = secrets.get("UPSTASH_REDIS_REST_TOKEN")
    tmdb_url = secrets.get("TMDB_API_URL")
    tmdb_key = secrets.get("TMDB_API_KEY")

    redis = Redis(url=redis_connection_string, token=redis_connection_token)

    cached_movies = dict()

    async def get_genres(client):
        genres = client.send(fetch_genres(tmdb_url, tmdb_key))
        genres = (await genres).json()["genres"]
        genres = list[Genre](
            filter(lambda genre: genre["name"] != "Documentary", genres)
        )
        genres.sort(key=itemgetter("name"))
        return genres

    async def get_trending_movies_by_genre(genres, client):
        trending_movies_by_genre = await asyncio.gather(
            *[
                fetch_trending_movies_by_genre(
                    tmdb_url,
                    tmdb_key,
                    genre,
                    client,
                    cached_movies,
                )
                for genre in genres
            ]
        )

        await redis.set(
            Movies_Type.TrendingMoviesByGenre.name, json.dumps(trending_movies_by_genre)
        )

    async def get_top_popular_movies(client):
        top_popular_movies = await fetch_top_popular_movies(
            tmdb_url, tmdb_key, client, cached_movies
        )

        await redis.set(
            Movies_Type.TopPopularMovies.name, json.dumps(top_popular_movies)
        )

    async def get_top_trending_movies(client):
        top_trending_movies = await fetch_top_trending_movies(
            tmdb_url, tmdb_key, client, cached_movies
        )

        await redis.set(
            Movies_Type.TopTrendingMovies.name, json.dumps(top_trending_movies)
        )

    async def get_now_playing_movies(client):
        now_playing_movies = await fetch_now_playing_movies(
            tmdb_url, tmdb_key, client, cached_movies
        )

        await redis.set(
            Movies_Type.NowPlayingMovies.name, json.dumps(now_playing_movies)
        )

    async def get_popular_movies_by_decade(client):
        end_decade = (date.today().year // 10) * 10
        start_decade = end_decade - (5 * 10)

        state: Dict[int, List[MoviesByGenre]] = dict()

        for decade in range(start_decade, end_decade + 1, 10):
            state[decade] = []

        decade_genre_iter = product(range(start_decade, end_decade + 1, 10), genres)

        await asyncio.gather(
            *[
                fetch_popular_movies_by_genre_and_decade(
                    tmdb_url,
                    tmdb_key,
                    decade,
                    genre,
                    client,
                    cached_movies,
                    state,
                )
                for decade, genre in decade_genre_iter
            ]
        )

        await asyncio.gather(
            *[
                redis.set(f"movies_{decade}", json.dumps(movies_by_genre))
                for decade, movies_by_genre in state.items()
            ]
        )

    limits = httpx.Limits(
        max_connections=50,
        max_keepalive_connections=50,
        keepalive_expiry=300,
    )

    async with httpx.AsyncClient(timeout=60, limits=limits) as client:
        # TODO: nest redis client
        genres = await get_genres(client)
        await asyncio.gather(
            get_trending_movies_by_genre(genres, client),
            get_top_popular_movies(client),
            get_top_trending_movies(client),
            get_now_playing_movies(client),
            get_popular_movies_by_decade(client),
        )
