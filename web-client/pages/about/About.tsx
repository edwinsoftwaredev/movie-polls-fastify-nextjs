import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './About.module.scss';

const About: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>About</span>
    </div>
  );
};

About.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default About;
