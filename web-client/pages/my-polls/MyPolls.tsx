import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './MyPolls.module.scss';

const MyPolls: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>MyPolls</span>
    </div>
  );
}

MyPolls.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default MyPolls;
