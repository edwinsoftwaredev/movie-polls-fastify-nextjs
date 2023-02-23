import trpc from 'src/trpc/client';
import { Movie } from 'types';

interface UseMovieProps {
  movieId: Movie['id'];
}

const useMovie = ({ movieId }: UseMovieProps) => {
  const { data: movieData, isLoading } = trpc.publicMovies.movie.useQuery(
    { movieId },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  if (!movieData || !movieData?.movie) return { movie: undefined };

  const { movie } = movieData;

  return { movie, isLoading };
};

export default useMovie;
