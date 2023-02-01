import Link from 'next/link';
import Label from './Label';
import styles from './Tabs.module.scss';

interface TabsProps {
  tabs?: Array<{
    title: string;
    icon?: 'image' | 'leaderboard' | 'subscriptions';
    href?: string;
  }>;
  onTabClick?: (tabTitle: string) => void;
  defaultActiveTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, onTabClick, defaultActiveTab }) => {
  return (
    <nav className={styles['tabs']}>
      <ul className={styles['tab-list']}>
        {tabs?.map((tab) => (
          <li key={tab.title}>
            {tab.href ? (
              <Link
                href={tab.href}
                className={
                  defaultActiveTab === tab.title ? styles['active'] : ''
                }
              >
                <Label>{tab.title}</Label>
              </Link>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClick && onTabClick(tab.title);
                }}
                className={
                  defaultActiveTab === tab.title ? styles['active'] : ''
                }
              >
                <span
                  className={`material-symbols-rounded ${
                    defaultActiveTab === tab.title ? 'active' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <Label>{tab.title}</Label>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Tabs;
