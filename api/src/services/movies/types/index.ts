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
  };
}

export interface MovieDetail {
  homepage: string;
  release_date: string;
  iso_3166_1: string;
  certification: string;
}

export interface MovieProviders {
  link: string;
  flatrate: [
    {
      logo_path: string;
      provider_id: number;
      display_priority: number;
      provider_name: string;
    }
  ];
  rent: [
    {
      logo_path: string;
      provider_id: number;
      display_priority: number;
      provider_name: string;
    }
  ];
  buy: [
    {
      logo_path: string;
      provider_id: number;
      display_priority: number;
      provider_name: string;
    }
  ];
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
