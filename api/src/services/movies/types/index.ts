export interface MovieRequest {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  genre_names?: string[]; // this is a custom property
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MovieDetail extends Movie {
  homepage: string;
  genres: {
    id: number,
    name: string,
  }[],
  production_countries: {
    iso_3166_1: string;
    name: string
  }[];
  credits: {
    cast: {
      name: string;
    }[];
    crew: {
      job: string;
      name: string
    }[];
  };
  release_dates: {
    results: {
      iso_3166_1: string;
      release_dates: {
        certification: string;
      }[];
    }[];
  };
  runtime: number;
  providers: any;
}

export interface GenreRequest {
  genres: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MoviesByGenre {
  genre_name: string;
  results: Movie[];
}

export const getMovieFromMovieDetails = (movie: MovieDetail): Movie => {
  return {
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genre_ids: movie.genres.map(genre => genre.id),
    id: movie.id,
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: movie.title,
    video: movie.video,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_names: movie.genres.map(genre => genre.name)
  }
};
