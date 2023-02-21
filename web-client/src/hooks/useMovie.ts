import trpc from 'src/trpc/client';
import { Movie } from 'types';

interface UseMovieProps {
  movieId: Movie['id'];
}

const useMovie = ({ movieId }: UseMovieProps) => {
  const { data: movieData } = trpc.publicMovies.movie.useQuery(
    { movieId },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  if (!movieData) return { movie: undefined };

  return { movie: movieData };
};

export default useMovie;
