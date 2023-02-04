import Tabs from '../Tabs';
import styles from './AppTabs.module.scss';

const routes: Record<string, string> = {
  topmovies: 'Popular Movies',
  trendingmovies: 'Trending Movies',
};

interface AppTabsProps {
  currentPath: '/topmovies' | '/trendingmovies' | '/';
}

const AppTabs: React.FC<AppTabsProps> = ({ currentPath }) => {
  return (
    <div className={styles['app-tabs']}>
      <Tabs
        tabs={[
          {
            title: 'Home',
            href: '/',
          },
          {
            title: 'Popular Movies',
            href: '/topmovies',
          },
          {
            title: 'Trending Movies',
            href: '/trendingmovies',
          },
        ]}
        defaultActiveTab={
          currentPath
            ? currentPath === '/'
              ? 'Home'
              : routes[currentPath.slice(1)]
            : ''
        }
      />
    </div>
  );
};

export default AppTabs;
