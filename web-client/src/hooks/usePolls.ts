import { useRef, useState } from 'react';
import trpc from 'src/trpc/client';
import { Poll } from 'src/types/poll';
import { InferQueryOutput } from 'trpc/client/utils';
import { Movie } from 'types';

interface UsePollsOpts {
  fetchActivePolls?: boolean;
  fetchInactivePolls?: boolean;
}

const usePolls = ({ fetchInactivePolls, fetchActivePolls }: UsePollsOpts) => {
  // NOTE: using useRef instead of useState.
  // onMutate may set state after onError.
  const removedPolls = useRef<Array<Poll>>([]);
  const removedMovies = useRef<Poll['MoviePolls']>([]);

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
            ctx: pollContext.activePolls,
            pollId: poll.id,
          })
        : updatePolls(undefined, {
            ctx: pollContext.inactivePolls,
            pollId: poll.id,
          }));

    op === 'add' &&
      (!poll.isActive
        ? pollContext.inactivePolls.setData(undefined, {
            polls: [
              ...(pollContext.inactivePolls.getData()?.polls || []),
              poll as Poll,
            ],
          })
        : pollContext.activePolls.setData(undefined, {
            polls: [
              ...(pollContext.activePolls.getData()?.polls || []),
              poll as Poll,
            ],
          }));
  };

  const {
    data: activePollsData,
    isLoading: isLoadingActivePolls,
    isSuccess: isSuccessActivePolls,
  } = trpc.poll.activePolls.useQuery(undefined, {
    enabled: fetchActivePolls,
    refetchOnMount: false,
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
      upsertOrRemovePoll(input.poll, 'add');
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
      const removedPoll = removedPolls.current.find(
        (poll) => poll.id === input.poll.id
      );

      if (!removedPoll) return;

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
        { ...poll, MoviePolls: [...poll.MoviePolls, input.moviePoll] },
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
      const poll = inactivePolls?.polls
        .filter((p) => p.id === input.pollId)
        .shift();
      const moviePoll = poll?.MoviePolls.find(
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
            MoviePolls: [
              ...(poll?.MoviePolls.filter(
                (mp) =>
                  !(mp.movieId === input.movieId && mp.pollId === input.pollId)
              ) || []),
            ],
          },
          'update'
        );
    },
    onSuccess: async (input) => {
      const removedMovie = removedMovies.current.find(
        (moviePoll) =>
          moviePoll.pollId === input.moviePoll.pollId &&
          moviePoll.movieId === input.moviePoll.movieId
      );

      if (removedMovie) {
        removedMovies.current = removedMovies.current.filter(
          (movie) =>
            movie.pollId !== input.moviePoll.pollId &&
            movie.movieId !== input.moviePoll.movieId
        );
      }
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
          { ...poll, MoviePolls: [...poll.MoviePolls, removedMovie] },
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
  };
};

export default usePolls;
