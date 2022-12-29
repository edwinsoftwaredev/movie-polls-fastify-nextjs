export interface MovieRequest {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  adult: boolean;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  title: string;
  runtime: number;
  genres: [
    {
      id: number;
      name: string;
    }
  ];
  images: {
    backdrops: [
      {
        width: number;
        height: number;
        file_path: string;
      }
    ];
    posters: [
      {
        width: number;
        height: number;
        file_path: string;
      }
    ];
  };
  credits: {
    cast: Array<{
      name: string;
    }>;
    crew: Array<{
      job: string;
      name: string;
    }>;
  }
}

export interface MovieDetail extends Movie {
  homepage: string;
  release_dates: {
    results: {
      iso_3166_1: string;
      release_dates: {
        release_date: string;
        certification: string;
      }[];
    }[];
  };
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
    images: movie.images,
    genres: movie.genres,
    id: movie.id,
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    release_date: movie.release_date,
    title: movie.title,
    vote_average: movie.vote_average,
    runtime: movie.runtime,
    credits: movie.credits
  };
};
