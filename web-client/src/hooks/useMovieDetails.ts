import { useEffect, useState } from 'react';
import trpc from 'src/trpc/client';
import { Movie } from 'types';

const useMovieDetails = (movie: Movie, fetchAdditionalDetails: boolean) => {
  const { data: additionalDetailsData } = trpc.publicMovies.movieDetails.useQuery({
    movieId: movie.id,
  }, {
    enabled: fetchAdditionalDetails,
  });
  const additionalDetails = additionalDetailsData?.movieDetails;

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
  const [ratingLabel, setRatingLabel] = useState(
    additionalDetails?.release_dates.results[0].release_dates[0].certification
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

  useEffect(() => {
    setRatingLabel(additionalDetails?.release_dates.results[0].release_dates[0].certification)
  }, [additionalDetails?.release_dates]);

  return {
    genresLabel,
    directorLabel,
    castLabel,
    runtimeLabel,
    ...movie,

    ...(
      additionalDetails ? ({ additionalDetails: {
        ratingLabel: ratingLabel
      }}) : {}
    )
 };
};

export default useMovieDetails;
