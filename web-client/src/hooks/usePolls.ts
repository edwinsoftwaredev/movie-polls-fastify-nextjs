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
    }
  );

  const { mutate: createPoll, isLoading: isLoadingCreatePoll } =
    trpc.poll.createPoll.useMutation({
      onSuccess: (data, variables, context) => {},
    });

  return {
    inactivePolls: inactivePollsData?.polls || [],
    createPoll,
    isLoadingCreatePoll,
  };
};

export default usePolls;
