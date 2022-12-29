import { useEffect, useState } from 'react';
import { Movie } from 'types';

const useMovieDetails = (movie: Movie) => {
  const [genresLabel, setGenresLabel] = useState(
    movie.genres.map((movie) => movie.name).join(', ')
  );
  const [directorLabel, setDirectorLabel] = useState(
    movie.credits.crew
      .filter((c) => c.job === 'Director')
      .map((c) => c.name)
      .join(', ')
  );
  const [castLabel, setCastLabel] = useState(
    movie.credits.cast.map((c) => c.name).join(', ')
  );
  const [runtimeLabel, setRuntimeLabel] = useState(
    `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
  );

  useEffect(() => {
    setGenresLabel(movie.genres.map((movie) => movie.name).join(', '));
  }, [movie.genres]);

  useEffect(() => {
    setDirectorLabel(
      movie.credits.crew
        .filter((c) => c.job === 'Director')
        .map((c) => c.name)
        .join(', ')
    );
  }, [movie.credits.crew]);

  useEffect(() => {
    setCastLabel(movie.credits.cast.map((c) => c.name).join(', '));
  }, [movie.credits.cast]);

  useEffect(() => {
    setRuntimeLabel(
      `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    );
  }, [movie.runtime]);

  return {
    genresLabel,
    directorLabel,
    castLabel,
    runtimeLabel,
    ...movie,
  };
};

export default useMovieDetails;
