import Link from 'next/link';
import Button from './Button';
import Label from './Label';
import styles from './Tabs.module.scss';

interface TabsProps {
  tabs?: Array<{
    title: string;
    icon?: 'image' | 'leaderboard' | 'subscriptions' | 'edit_square';
    href?: string;
  }>;
  onTabClick?: (tabTitle: string) => void;
  defaultActiveTab?: string;
  iconPos?: 'top' | 'left';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  onTabClick,
  defaultActiveTab,
  iconPos,
}) => {
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
              <div
                className={`${
                  defaultActiveTab === tab.title ? styles['active'] : ''
                }`}
              >
                <Button
                  icon={!!tab.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClick && onTabClick(tab.title);
                  }}
                >
                  <div className={`${styles[`icon-pos-${iconPos || 'top'}`]}`}>
                    {!!tab.icon && (
                      <span
                        className={`material-symbols-rounded ${
                          defaultActiveTab === tab.title ? 'active' : ''
                        }`}
                      >
                        {tab.icon}
                      </span>
                    )}
                    <Label>{tab.title}</Label>
                  </div>
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Tabs;
