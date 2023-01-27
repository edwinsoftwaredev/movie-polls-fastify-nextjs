import { useEffect, useState } from 'react';
import trpc from 'src/trpc/client';

const useSessionDetails = () => {
  const { data: sessionData } = trpc.session.getSession.useQuery(undefined, {
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: accountData } = trpc.account.whoami.useQuery(undefined, {
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [displayName, setDisplayName] = useState(accountData?.whoami?.displayName);
  const [picture, setPicture] = useState(accountData?.whoami?.picture);
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionData?.isAuthenticated);

  useEffect(() => {
    setDisplayName(accountData?.whoami?.displayName);
    setPicture(accountData?.whoami?.picture);
  }, [accountData?.whoami]);

  useEffect(() => {
    setIsAuthenticated(!!sessionData?.isAuthenticated);
  }, [sessionData?.isAuthenticated]);

  return {
    isAuthenticated,
    displayName,
    picture,
  }
};

export default useSessionDetails;
