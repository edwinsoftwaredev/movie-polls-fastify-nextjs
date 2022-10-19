import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import Layout from "src/components/layout";
import style from './Contact.module.scss';

const Contact: NextPageWithLayout = () => {
  return (
    <div className={style['main']}>
      <span>Contact</span>
    </div>
  );
}

Contact.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default Contact;
