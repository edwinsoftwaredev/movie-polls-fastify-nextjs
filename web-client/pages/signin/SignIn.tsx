import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './SignIn.module.scss';

const SignIn: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>Sign In</span>
    </div>
  );
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default SignIn;
