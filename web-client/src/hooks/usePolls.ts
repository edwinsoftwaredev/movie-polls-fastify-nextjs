import { useRef, useState } from 'react';
import trpc from 'src/trpc/client';
import { Poll } from 'src/types/poll';
import { Movie } from 'types';

interface UsePollsOpts {
  fetchInactivePolls?: boolean;
}

const usePolls = ({ fetchInactivePolls }: UsePollsOpts) => {
  // NOTE: using useRef instead of useState.
  // onMutate may set state after onError.
  const removedPolls = useRef<Array<Poll>>([]);
  const removedMovies = useRef<Poll['MoviePolls']>([]);

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
      // consider updating the input type to Poll type
      const removedPoll = inactivePolls?.polls.find(
        (poll) => poll.id === input.pollId
      );

      if (removedPoll) {
        removedPolls.current = [...removedPolls.current, removedPoll];
      }

      pollContext.inactivePolls.setData(undefined, {
        polls:
          inactivePolls?.polls.filter((poll) => poll.id !== input.pollId) || [],
      });
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
      const inactivePoll = pollContext.inactivePolls.getData();
      const removedPoll = removedPolls.current.find(
        (poll) => poll.id === data.pollId
      );

      if (!removedPoll) return;

      pollContext.inactivePolls.setData(undefined, {
        polls: [...(inactivePoll?.polls || []), removedPoll],
      });

      removedPolls.current = removedPolls.current.filter(
        (poll) => poll.id !== data.pollId
      );

      // TODO: show error message
    },
    // TODO: update
    retry: false,
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

      const moviePoll = inactivePolls?.polls
        .flatMap((poll) => poll.MoviePolls)
        .find(
          (moviePoll) =>
            moviePoll.pollId === input.pollId &&
            moviePoll.movieId === input.movieId
        );

      if (moviePoll)
        removedMovies.current = [...removedMovies.current, moviePoll];

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

      if (removedMovie) {
        pollContext.inactivePolls.setData(undefined, {
          polls:
            inactivePoll?.polls.map((poll) => {
              if (poll.id === data.pollId) {
                return {
                  ...poll,
                  MoviePolls: [...poll.MoviePolls, removedMovie],
                };
              }

              return poll;
            }) || [],
        });

        removedMovies.current = removedMovies.current.filter(
          (movie) =>
            movie.pollId !== data.pollId && movie.movieId !== data.movieId
        );

        // TODO: show error message
      }
    },
    // TODO: update
    retry: false,
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
