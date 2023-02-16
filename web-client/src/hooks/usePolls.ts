import trpc from 'src/trpc/client';

interface UsePollsOpts {
  fetchInactivePolls?: boolean;
}

const usePolls = ({ fetchInactivePolls }: UsePollsOpts) => {
  const { poll: pollContext } = trpc.useContext();

  const {
    data: inactivePollsData,
    isLoading: isLoadingInactivePolls,
    isSuccess: isSuccessInactivePolls,
  } = trpc.poll.inactivePolls.useQuery(undefined, {
    enabled: fetchInactivePolls ?? false,
    refetchOnMount: false,
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

      const data = pollContext.inactivePolls.getData();
      // await pollContext.inactivePolls.cancel();
      pollContext.inactivePolls.setData(undefined, {
        polls: [...(data?.polls || []), input.poll],
      });
    },
  });

  const {
    mutate: updatePoll,
    isLoading: isLoadingUpdatePoll,
    isSuccess: isSuccessUpdatePoll,
  } = trpc.poll.updatePoll.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();

      const inactivePolls = pollContext.inactivePolls.getData();
      if (!input.poll.isActive) {
        // TODO: remove from active polls
        pollContext.inactivePolls.setData(undefined, {
          polls:
            inactivePolls?.polls.map((poll) => {
              if (poll.id === input.poll.id)
                return {
                  ...poll,
                  ...input.poll,
                };
              return poll;
            }) || [],
        });
      } else {
        // TODO: add to active polls
        // TODO: remove from inactive polls
      }
    },
  });

  const {
    mutate: removePoll,
    isLoading: isLoadingRemovePoll,
    isSuccess: isSuccessRemovePoll,
  } = trpc.poll.removePoll.useMutation({
    onMutate: async (input) => {
      // await pollContext.inactivePolls.cancel();

      // TODO: remove from active polls
      const inactivePolls = pollContext.inactivePolls.getData();
      pollContext.inactivePolls.setData(undefined, {
        polls:
          inactivePolls?.polls.filter((poll) => poll.id !== input.pollId) || [],
      });
    },
    // TODO: revert on error
  });

  const {
    mutate: addMovie,
    isLoading: isLoadingAddMovie,
    isSuccess: isSuccessAddMovie,
  } = trpc.poll.addMovie.useMutation({
    onSuccess: async (input) => {
      // await pollContext.inactivePolls.cancel();

      // TODO: check active polls
      const inactivePolls = pollContext.inactivePolls.getData();
      pollContext.inactivePolls.setData(undefined, {
        polls:
          inactivePolls?.polls.map((poll) => {
            if (poll.id === input.moviePoll.pollId) {
              return {
                ...poll,
                MoviePolls: [...poll.MoviePolls, input.moviePoll],
              };
            }
            return poll;
          }) || [],
      });
    },
  });

  const {
    mutate: removeMovie,
    isLoading: isLoadingRemoveMovie,
    isSuccess: isSuccessRemoveMovie,
  } = trpc.poll.removeMovie.useMutation({
    onMutate: async (input) => {
      const inactivePolls = pollContext.inactivePolls.getData();
      pollContext.inactivePolls.setData(undefined, {
        polls:
          inactivePolls?.polls.map((poll) => {
            if (poll.id === input.pollId) {
              return {
                ...poll,
                MoviePolls: poll.MoviePolls.filter(
                  (moviePoll) => moviePoll.movieId !== input.movieId
                ),
              };
            }
            return poll;
          }) || [],
      });
    },
    // TODO: Revert on Error
  });

  return {
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
  };
};

export default usePolls;
