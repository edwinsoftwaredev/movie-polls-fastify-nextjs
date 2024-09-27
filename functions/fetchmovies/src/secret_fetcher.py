import os
import httpx


def fetch_secrets():
    r = httpx.get(os.getenv("DOPPLER_URL", ""))
    return r.json()
