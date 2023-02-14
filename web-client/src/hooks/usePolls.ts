import trpc from 'src/trpc/client';

interface UsePollsOpts {
  fetchInactivePolls?: boolean;
}

const usePolls = ({ fetchInactivePolls }: UsePollsOpts) => {
  const { poll: pollContext } = trpc.useContext();

  const { data: inactivePollsData } = trpc.poll.inactivePolls.useQuery(
    undefined,
    {
      enabled: fetchInactivePolls ?? false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) =>
        data.polls.sort(
          (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
        ),
    }
  );

  const {
    mutate: createPoll,
    isLoading: isLoadingCreatePoll,
    isSuccess: isSuccessCreatePoll,
    isIdle: isIdleCreatePoll,
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

  return {
    inactivePolls: inactivePollsData?.polls || [],
    createPoll,
    isLoadingCreatePoll,
    isSuccessCreatePoll,
  };
};

export default usePolls;
