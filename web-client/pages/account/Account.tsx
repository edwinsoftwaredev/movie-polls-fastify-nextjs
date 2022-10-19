import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect } from "react";
import Layout from "src/components/layout";
import trpc from "src/trpc";
import style from './Account.module.scss';

const Account: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: sessionData } = trpc.useQuery(['session:getSession']);

  useEffect(() => {
    if (!sessionData?.isAuthenticated) router.replace('/');
  }, [sessionData?.isAuthenticated]);

  return (
    <div className={style['main']}>
      {
        sessionData?.isAuthenticated ? (
          <span>Account</span>
        ) : (
          <span>Redirecting...</span>
        )
      }
    </div>
  );
};

Account.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default Account;
