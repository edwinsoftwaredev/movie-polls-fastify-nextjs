// TODO: consider refactor into a server component
'use client';

import { usePolls } from 'hooks';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import PollMovies from 'src/components/poll-movies/PollMovies';
import { InferQueryOutput } from 'trpc/client/utils';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const MovieList: React.FC<{
  pollId: PollType['id'];
  movies: PollType['MoviePoll'];
  isPollOwner: boolean;
  isActivePoll: boolean;
}> = ({ pollId, movies, isPollOwner, isActivePoll }) => {
  const router = useRouter();
  const { removeMovie } = usePolls({});

  const [isPending, startTransition] = useTransition();

  return (
    <PollMovies
      movies={movies}
      {...(!isActivePoll && isPollOwner
        ? {
            onRemoveMovie: (movieId) => {
              removeMovie(
                { movieId, pollId },
                {
                  onSuccess: () => {
                    startTransition(() => {
                      router.refresh();
                    });
                  },
                }
              );
            },
          }
        : {})}
      {...(isActivePoll && isPollOwner
        ? {
            showProgress: true,
          }
        : {})}
    />
  );
};

export default MovieList;
