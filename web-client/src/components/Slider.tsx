'use client';

import type { InferQueryOutput } from 'trpc/client/utils';

type Movies =
  InferQueryOutput<'movies:trendingByGenre'>['trendingByGenre'][0]['results'];

interface SliderProps {
  movies: Movies;
}

const Slider: React.FC<SliderProps> = ({ movies }) => {
  return (
    <ul>
      {movies.map((movie) => (
        <li key={movie.id}>{movie.title}</li>
      ))}
    </ul>
  );
};

export default Slider;
