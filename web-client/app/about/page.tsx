import style from './About.module.scss';

export const metadata = {
  title: 'About',
};

export default async function Page() {
  return (
    <div className={style['main']}>
      <span>About</span>
    </div>
  );
}
