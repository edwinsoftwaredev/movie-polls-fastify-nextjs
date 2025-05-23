import { useRef } from 'react';
import trpc from 'src/trpc/client';
import { InferQueryOutput } from 'trpc/client/utils';

interface UsePollsOpts {
  fetchActivePolls?: boolean;
  fetchInactivePolls?: boolean;
}

type Poll = InferQueryOutput<'poll'>['getPoll']['poll'];

const usePolls = ({ fetchInactivePolls, fetchActivePolls }: UsePollsOpts) => {
  // NOTE: using useRef instead of useState.
  // onMutate may set state after onError.
  const removedPolls = useRef<InferQueryOutput<'poll'>['removePoll']['poll'][]>(
    []
  );
  const removedMovies = useRef<
    InferQueryOutput<'poll'>['removeMovie']['moviePoll'][]
  >([]);
  const removedVotingTokens = useRef<
    Array<InferQueryOutput<'poll'>['removeVotingToken']['votingToken']>
  >([]);

  const { poll: pollContext } = trpc.useContext();

  const updatePolls = (
    update?: {
      poll: Poll;
      ctx: typeof pollContext.inactivePolls | typeof pollContext.activePolls;
    },
    removeFrom?: {
      pollId: Poll['id'];
      ctx: typeof pollContext.activePolls | typeof pollContext.inactivePolls;
    }
  ) => {
    if (update) {
      const addToArr = update.ctx.getData();
      // add or update to
      update.ctx.setData(undefined, {
        polls:
          addToArr?.polls.map((p) => {
            if (p.id === update.poll.id)
              return {
                ...p,
                ...update.poll,
              };
            return p;
          }) || [],
      });
    }

    if (removeFrom) {
      const removeFromArr = removeFrom.ctx.getData();
      // remove from
      removeFrom.ctx.setData(undefined, {
        polls:
          removeFromArr?.polls.filter(
            (poll) => poll.id !== removeFrom.pollId
          ) || [],
      });
    }
  };

  const upsertOrRemovePoll = (poll: Poll, op: 'add' | 'update' | 'remove') => {
    op === 'update' &&
      (!poll.isActive
        ? updatePolls(
            { ctx: pollContext.inactivePolls, poll: poll },
            { ctx: pollContext.activePolls, pollId: poll.id }
          )
        : updatePolls(
            { ctx: pollContext.activePolls, poll: poll },
            { ctx: pollContext.inactivePolls, pollId: poll.id }
          ));

    op === 'remove' &&
      (!poll.isActive
        ? updatePolls(undefined, {
            ctx: pollContext.inactivePolls,
            pollId: poll.id,
          })
        : updatePolls(undefined, {
            ctx: pollContext.activePolls,
            pollId: poll.id,
          }));

    op === 'add' &&
      (!poll.isActive
        ? pollContext.inactivePolls.setData(undefined, {
            polls: [
              ...(pollContext.inactivePolls.getData()?.polls || []),
              poll as InferQueryOutput<'poll'>['getPoll']['poll'],
            ],
          })
        : pollContext.activePolls.setData(undefined, {
            polls: [
              ...(pollContext.activePolls.getData()?.polls || []),
              poll as InferQueryOutput<'poll'>['getPoll']['poll'],
            ],
          }));
  };

  const {
    data: activePollsData,
    isLoading: isLoadingActivePolls,
    isSuccess: isSuccessActivePolls,
  } = trpc.poll.activePolls.useQuery(undefined, {
    enabled: fetchActivePolls ?? false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) =>
      data.polls.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ),
  });

  const {
    data: inactivePollsData,
    isLoading: isLoadingInactivePolls,
    isSuccess: isSuccessInactivePolls,
  } = trpc.poll.inactivePolls.useQuery(undefined, {
    enabled: fetchInactivePolls ?? false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) =>
      data.polls.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      ),
  });

  const {
    mutate: createPoll,
    isLoading: isLoadingCreatePoll,
    isSuccess: isSuccessCreatePoll,
  } = trpc.poll.createPoll.useMutation({
    onSuccess: async (input) => {
      if (!(input && input.poll)) return;
      // await pollContext.inactivePolls.cancel();
      upsertOrRemovePoll(input.poll as Poll, 'add');
    },
  });

  const {
    mutate: updatePoll,
    isLoading: isLoadingUpdatePoll,
    isSuccess: isSuccessUpdatePoll,
  } = trpc.poll.updatePoll.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();
      upsertOrRemovePoll(input.poll as Poll, 'update');
    },
  });

  const {
    mutate: removePoll,
    isLoading: isLoadingRemovePoll,
    isSuccess: isSuccessRemovePoll,
  } = trpc.poll.removePoll.useMutation({
    onMutate: async (input) => {
      // await pollContext.inactivePolls.cancel();
      const inactivePolls = pollContext.inactivePolls.getData();
      const activePolls = pollContext.inactivePolls.getData();

      // consider updating the input type to Poll type
      const removedPoll =
        inactivePolls?.polls.find((poll) => poll.id === input.pollId) ||
        activePolls?.polls.find((poll) => poll.id === input.pollId);

      if (removedPoll) {
        removedPolls.current = [...removedPolls.current, removedPoll];
      }

      upsertOrRemovePoll(removedPoll as Poll, 'remove');
    },
    onSuccess: async (input) => {
      removedPolls.current = removedPolls.current.filter(
        (poll) => poll.id !== input.poll.id
      );
    },
    onError: async (_error, data) => {
      const removedPoll = removedPolls.current.find(
        (poll) => poll.id === data.pollId
      );

      if (!removedPoll) return;

      upsertOrRemovePoll(removedPoll as Poll, 'add');

      removedPolls.current = removedPolls.current.filter(
        (poll) => poll.id !== data.pollId
      );

      // TODO: show error message
    },
    retry: false,
  });

  const {
    mutate: addMovie,
    isLoading: isLoadingAddMovie,
    isSuccess: isSuccessAddMovie,
  } = trpc.poll.addMovie.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();
      const inactivePolls = pollContext.inactivePolls.getData();
      const activePolls = pollContext.activePolls.getData();
      const poll =
        inactivePolls?.polls.find(
          (poll) => poll.id === input.moviePoll.pollId
        ) ||
        activePolls?.polls.find((poll) => poll.id === input.moviePoll.pollId);

      if (!poll) return;

      upsertOrRemovePoll(
        { ...poll, MoviePoll: [...poll.MoviePoll, input.moviePoll] } as Poll,
        'update'
      );
    },
  });

  const {
    mutate: removeMovie,
    isLoading: isLoadingRemoveMovie,
    isSuccess: isSuccessRemoveMovie,
  } = trpc.poll.removeMovie.useMutation({
    onMutate: async (input) => {
      const inactivePolls = pollContext.inactivePolls.getData();
      const poll = inactivePolls?.polls.find((p) => p.id === input.pollId);
      const moviePoll = poll?.MoviePoll.find(
        (moviePoll) =>
          moviePoll.pollId === input.pollId &&
          moviePoll.movieId === input.movieId
      );

      if (moviePoll)
        removedMovies.current = [...removedMovies.current, moviePoll];

      poll &&
        upsertOrRemovePoll(
          {
            ...poll,
            MoviePoll: [
              ...(poll?.MoviePoll.filter(
                (mp) =>
                  !(mp.movieId === input.movieId && mp.pollId === input.pollId)
              ) || []),
            ],
          },
          'update'
        );
    },
    onSuccess: async (input) => {
      removedMovies.current = removedMovies.current.filter(
        (movie) =>
          movie.pollId !== input.moviePoll.pollId &&
          movie.movieId !== input.moviePoll.movieId
      );
    },
    onError: async (_error, data) => {
      const inactivePoll = pollContext.inactivePolls.getData();
      const removedMovie = removedMovies.current.find(
        (moviePoll) =>
          moviePoll.pollId === data.pollId && moviePoll.movieId === data.movieId
      );
      const poll = inactivePoll?.polls.find(
        (p) => p.id === removedMovie?.pollId
      );

      removedMovie &&
        poll &&
        upsertOrRemovePoll(
          { ...poll, MoviePoll: [...poll.MoviePoll, removedMovie] } as Poll,
          'update'
        );

      removedMovies.current = removedMovies.current.filter(
        (movie) =>
          movie.pollId !== data.pollId && movie.movieId !== data.movieId
      );
      // TODO: show error message
    },
    // TODO: update
    retry: false,
  });

  /**
   * NOTE: Adding, updating or removing voting tokens only happend on client side.
   * The poll should be refetched using router.refresh or getPoll.refetch api
   * */
  const {
    mutate: addVotingTokens,
    isSuccess: isSuccessAddVotingTokens,
    isLoading: isLoadingAddVotingTokens,
  } = trpc.poll.addVotingTokens.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();
      pollContext.votingTokens.setData(
        { pollId: input.poll.id },
        {
          tokens: input.poll.VotingToken.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        }
      );
    },
  });

  const {
    mutate: updateVotingToken,
    isLoading: isLoadingUpdateVotingToken,
    isSuccess: isSuccessUpdateVotingToken,
  } = trpc.poll.updateVotingToken.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();
      const votingTokens = pollContext.votingTokens.getData({
        pollId: input.votingToken.pollId,
      });
      pollContext.votingTokens.setData(
        { pollId: input.votingToken.pollId },
        {
          tokens:
            votingTokens?.tokens.map((vt) => {
              if (vt.id === input.votingToken.id) return input.votingToken;
              return vt;
            }) || [],
        }
      );
    },
  });

  const {
    mutate: removeVotingToken,
    isSuccess: isSuccessRemoveVotingToken,
    isLoading: isLoadingRemoveVotingToken,
  } = trpc.poll.removeVotingToken.useMutation({
    onMutate: async (input) => {
      const votingTokens = pollContext.votingTokens.getData({
        pollId: input.pollId,
      });

      if (!votingTokens) return;

      const votingToken = votingTokens?.tokens.find(
        (p) => p.id === input.id && p.pollId === input.pollId
      );

      if (!votingToken) return;

      removedVotingTokens.current = [
        ...removedVotingTokens.current,
        votingToken,
      ];

      pollContext.votingTokens.setData(
        { pollId: input.pollId },
        {
          tokens:
            votingTokens.tokens.filter((vt) => vt.id !== votingToken.id) || [],
        }
      );
    },
    onSuccess: async (input) => {
      removedVotingTokens.current = removedVotingTokens.current.filter(
        (votingToken) => votingToken.pollId !== input.votingToken.id
      );
    },
    onError: async (_error, data) => {
      const votingTokens = pollContext.votingTokens.getData({
        pollId: data.pollId,
      });

      if (!votingTokens) return;

      const removedVotingToken = removedVotingTokens.current.find(
        (removedVotingToken) =>
          removedVotingToken.pollId === data.pollId &&
          removedVotingToken.id === data.id
      );

      if (!removedVotingToken) return;

      removedVotingToken &&
        pollContext.votingTokens.setData(
          { pollId: data.pollId },
          { tokens: [...(votingTokens?.tokens || []), removedVotingToken] }
        );

      removedVotingTokens.current = removedVotingTokens.current.filter(
        (votingToken) =>
          votingToken.pollId !== data.pollId && votingToken.id !== data.id
      );
    },
    retry: false,
  });

  return {
    activePolls: activePollsData?.polls || [],
    isLoadingActivePolls,
    isSuccessActivePolls,
    inactivePolls: inactivePollsData?.polls || [],
    isLoadingInactivePolls,
    isSuccessInactivePolls,
    createPoll,
    isLoadingCreatePoll,
    isSuccessCreatePoll,
    updatePoll,
    isLoadingUpdatePoll,
    isSuccessUpdatePoll,
    removePoll,
    isLoadingRemovePoll,
    isSuccessRemovePoll,
    addMovie,
    isLoadingAddMovie,
    isSuccessAddMovie,
    removeMovie,
    isLoadingRemoveMovie,
    isSuccessRemoveMovie,
    addVotingTokens,
    isSuccessAddVotingTokens,
    isLoadingAddVotingTokens,
    updateVotingToken,
    isLoadingUpdateVotingToken,
    isSuccessUpdateVotingToken,
    removeVotingToken,
    isSuccessRemoveVotingToken,
    isLoadingRemoveVotingToken,
  };
};

export default usePolls;
