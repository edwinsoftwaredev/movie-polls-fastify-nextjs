import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './search.module.scss';

const Search: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>Search</span>
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default Search;
