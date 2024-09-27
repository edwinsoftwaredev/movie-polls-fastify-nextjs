from operator import itemgetter

import httpx

from .app_types import Movie


class MovieDetailsError(Exception):
    """
    MovieDetailsError
    """


def merge_movie_details(movie, movie_details):
    # Base movie
    base_movie = {
        "adult": movie["adult"],
        "overview": movie["overview"],
        "release_date": movie["release_date"],
        "id": movie["id"],
        "original_title": movie["original_title"],
        "original_language": movie["original_language"],
        "title": movie["title"],
        "vote_average": movie["vote_average"],
        "vote_count": movie["vote_count"],
    }

    return {**base_movie, **movie_details}


def filter_movie_details(movie_details):
    # Filtered properties
    # Some lists are slices of their source lists
    genres = movie_details.get("genres")
    id = movie_details.get("id")
    runtime = movie_details.get("runtime")
    backdrops = movie_details["images"]["backdrops"]
    posters = movie_details["images"]["posters"]

    cast = filter(lambda c: not c["adult"], movie_details["credits"]["cast"][0:8])
    cast = list(map(lambda c: {"name": c["name"]}, cast))

    crew = filter(lambda c: c["job"] == "Director", movie_details["credits"]["crew"])
    crew = list(map(lambda c: {"job": c["job"], "name": c["name"]}, crew))

    backdrops.sort(key=itemgetter("width"), reverse=True)
    backdrops = list(
        map(
            lambda bdrop: {
                "width": bdrop["width"],
                "file_path": bdrop["file_path"],
                "height": bdrop["height"],
            },
            backdrops[0:1],
        )
    )

    posters = list(
        map(
            lambda pster: {
                "width": pster["width"],
                "file_path": pster["file_path"],
                "height": pster["height"],
            },
            posters[0:1],
        )
    )

    return {
        "genres": genres,
        "id": id,
        "runtime": runtime,
        "images": {"backdrops": backdrops, "posters": posters},
        "credits": {"cast": cast, "crew": crew},
    }


async def fetch_movie_details(
    tmdb_url: str,
    tmdb_key: str,
    movie,
    client: httpx.AsyncClient,
    cached_movies,
) -> Movie:
    if movie["id"] in cached_movies and cached_movies[movie["id"]] is None:
        raise MovieDetailsError(f'{movie['id']}')

    if movie["id"] in cached_movies:
        return cached_movies[movie["id"]]

    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    params["append_to_response"] = "images,credits"
    params["include_image_language"] = "en,null"

    movie_details = (
        await client.get(f"{tmdb_url}/movie/{movie['id']}", params=params)
    ).json()

    movie_details = filter_movie_details(movie_details)

    if (
        len(movie_details["images"]["backdrops"]) == 0
        or len(movie_details["images"]["posters"]) == 0
    ):
        cached_movies[movie["id"]] = None
        raise MovieDetailsError(f"Images not found for Movie {id}")

    cached_movies[movie["id"]] = merge_movie_details(movie, movie_details)

    return cached_movies[movie["id"]]
