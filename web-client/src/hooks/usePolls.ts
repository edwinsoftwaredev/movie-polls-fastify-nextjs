import trpc from 'src/trpc/client';

interface UsePollsOpts {
  fetchInactivePolls?: boolean;
}

const usePolls = ({ fetchInactivePolls }: UsePollsOpts) => {
  const { data: inactivePollsData } = trpc.poll.inactivePolls.useQuery(
    undefined,
    {
      enabled: fetchInactivePolls ?? false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    inactivePolls: inactivePollsData?.polls || [],
  };
};

export default usePolls;
