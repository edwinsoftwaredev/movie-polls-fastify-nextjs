from typing import List, TypedDict


class CastMember(TypedDict):
    name: str
    adult: bool


class CrewMember(TypedDict):
    job: str
    name: str


class Credits(TypedDict):
    cast: List[CastMember]
    crew: List[CrewMember]


class Image(TypedDict):
    width: int
    height: int
    file_path: str


class Backdrop(Image):
    pass


class Poster(Image):
    pass


class Images(TypedDict):
    backdrops: List[Backdrop]
    posters: List[Poster]


class Genre(TypedDict):
    id: int
    name: str


class Movie(TypedDict):
    adult: bool
    id: int
    original_language: str
    original_title: str
    overview: str
    vote_count: int
    vote_average: int
    release_date: str
    title: str
    runtime: int
    genres: List[Genre]
    images: Images
    credits: Credits


class MoviesByGenre(TypedDict):
    genre_name: str
    results: List[Movie]
