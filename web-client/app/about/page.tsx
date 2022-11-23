import style from './about.module.scss';

export default async function Page() {
  return (
    <div className={style['main']}>
      <span>About</span>
    </div>
  );
}
