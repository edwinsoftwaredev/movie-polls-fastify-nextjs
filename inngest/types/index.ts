export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  adult: boolean;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  vote_count: number;
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
      adult: boolean;
    }>;
    crew: Array<{
      job: string;
      name: string;
    }>;
  };
}
