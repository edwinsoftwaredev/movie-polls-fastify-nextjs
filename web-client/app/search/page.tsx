import Search from 'src/components/search/Search';
import style from './Search.module.scss';

export default async function Page() {
  return (
    <div className={style['search-page']}>
      <Search />
    </div>
  );
}
