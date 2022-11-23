import style from './mypolls.module.scss';

export default async function Page() {
  return (
    <div className={style['main']}>
      <span>MyPolls</span>
    </div>
  );
}
