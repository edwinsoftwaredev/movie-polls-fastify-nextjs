import httpx


def fetch_genres(tmdb_url: str, tmdb_key: str):
    params = dict()
    params["api_key"] = tmdb_key
    params["language"] = "en-US"
    return httpx.Request("GET", f"{tmdb_url}/genre/movie/list", params=params)
