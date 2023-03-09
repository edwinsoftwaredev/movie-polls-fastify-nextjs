import { useEffect, useState } from 'react';
import trpc from 'src/trpc/client';
import { Movie, MovieProviders } from 'types';

const sortProviders = (
  a: MovieProviders['flatrate'][0],
  b: MovieProviders['flatrate'][0]
) => a.display_priority - b.display_priority;

const useMovieDetails = (
  movie: Movie,
  fetchAdditionalDetails?: boolean,
  fetchProviders?: boolean
) => {
  const { data: additionalMovieDetails } =
    trpc.publicMovies.movieDetails.useQuery(
      { movieId: movie.id },
      {
        enabled: fetchAdditionalDetails ?? false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      }
    );

  const { data: providersData, isFetched: isProvidersDataFetched } =
    trpc.publicMovies.movieProviders.useQuery(
      { movieId: movie.id },
      {
        enabled: fetchProviders ?? false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      }
    );

  const additionalDetails = additionalMovieDetails?.movieDetails;

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
    additionalDetails?.certification
  );
  const [releaseYearLabel, setReleaseYearLabel] = useState(
    additionalDetails?.release_date?.split('-')[0]
  );
  const [providers, setProviders] = useState({
    link: providersData?.movieProviders.link,
    flatrate: providersData?.movieProviders?.flatrate.sort(sortProviders) ?? [],
    rent: providersData?.movieProviders?.rent.sort(sortProviders) ?? [],
    buy: providersData?.movieProviders?.buy.sort(sortProviders) ?? [],
    isProvidersDataFetched,
  });
  const [voteAverage, setVoteAverage] = useState(
    Math.round(movie.vote_average * 10)
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
    setRatingLabel(additionalDetails?.certification);
  }, [additionalDetails?.certification]);

  useEffect(() => {
    setReleaseYearLabel(additionalDetails?.release_date?.split('-')[0]);
  }, [additionalDetails?.release_date]);

  useEffect(() => {
    setProviders({
      link: providersData?.movieProviders.link,
      flatrate:
        providersData?.movieProviders?.flatrate.sort(sortProviders) ?? [],
      rent: providersData?.movieProviders?.rent.sort(sortProviders) ?? [],
      buy: providersData?.movieProviders?.buy.sort(sortProviders) ?? [],
      isProvidersDataFetched,
    });
  }, [providersData?.movieProviders]);

  useEffect(() => {
    setVoteAverage(Math.round(movie.vote_average * 10));
  }, [movie.vote_average]);

  return {
    genresLabel,
    directorLabel,
    castLabel,
    runtimeLabel,
    ...movie,
    vote_average: voteAverage,
    ...(additionalDetails
      ? {
          additionalDetails: {
            ratingLabel: ratingLabel,
            releaseYearLabel,
          },
        }
      : {}),
    providers,
  };
};

export default useMovieDetails;
