import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './trendingmovies.module.scss';

const TrendingMovies: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>Trending Movies</span>
    </div>
  );
}

TrendingMovies.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default TrendingMovies;
