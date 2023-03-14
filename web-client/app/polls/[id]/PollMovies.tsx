// TODO: consider refactor into a server component
'use client';

import { usePolls } from 'hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import PollMovies from 'src/components/poll-movies/PollMovies';
import trpc from 'src/trpc/client';
import { InferQueryOutput } from 'trpc/client/utils';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const MovieList: React.FC<{
  pollId: PollType['id'];
  movies: PollType['MoviePoll'];
  isPollOwner: boolean;
  isActivePoll: boolean;
  isPollExpired: boolean | null;
}> = ({ pollId, movies, isPollOwner, isActivePoll, isPollExpired }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeMovie } = usePolls({});
  const {
    publicPoll: { votingToken: votingTokenContext },
  } = trpc.useContext();
  const { data: votingTokenData } = trpc.publicPoll.votingToken.useQuery(
    {
      id: searchParams.get('vt') ?? '',
      pollId,
    },
    {
      enabled: searchParams.has('vt'),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: true,
      retryDelay(failureCount, error) {
        return 5;
      },
    }
  );
  const { mutate: mutateVote, isSuccess: isSuccessVote } =
    trpc.publicPoll.vote.useMutation({
      retry: false,
    });

  const [isPending, startTransition] = useTransition();

  const onRemoveMovieHandler = (movieId: number) => {
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
  };

  const onVoteHandler = (movieId: number) => {
    votingTokenData?.votingToken &&
      mutateVote(
        {
          pollId,
          votingTokenId: votingTokenData.votingToken.id,
          movieId,
        },
        {
          onSuccess: () => {
            startTransition(() => {
              router.refresh();
            });
            votingTokenContext.refetch({
              id: votingTokenData.votingToken.id,
              pollId,
            });
          },
        }
      );
  };

  return (
    <PollMovies
      movies={movies}
      onRemoveMovie={
        !isActivePoll && isPollOwner ? onRemoveMovieHandler : undefined
      }
      showProgress={
        (isActivePoll && isPollOwner) ||
        isPollExpired === true ||
        votingTokenData?.votingToken.unused === false
      }
      onVote={
        votingTokenData?.votingToken.unused === true ? onVoteHandler : undefined
      }
    />
  );
};

export default MovieList;
