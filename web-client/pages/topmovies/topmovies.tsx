import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './topmovies.module.scss';

const TopMovies: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>Top Movies</span>
    </div>
  );
}

TopMovies.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
};

export default TopMovies;
