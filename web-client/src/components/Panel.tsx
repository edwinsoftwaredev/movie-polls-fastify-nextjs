'use client';

import { PropsWithChildren, useState } from 'react';
import Label from './Label';
import styles from './Panel.module.scss';

interface PanelProps extends PropsWithChildren {
  tabs?: Array<{
    title: string;
    icon?: 'imagesmode' | 'leaderboard' | 'subscriptions';
  }>;
  onTabClick: (tabTitle: string) => void;
  defaultActiveTab?: string;
}

const Panel: React.FC<PanelProps> = ({
  tabs,
  onTabClick,
  defaultActiveTab,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  return (
    <div className={styles['panel']}>
      <div className={styles['children']}>{children}</div>
      {tabs?.length ? (
        <ul className={styles['panel-tabs']}>
          {tabs.map((tab) => (
            <li key={tab.title}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.title);
                  onTabClick(tab.title);
                }}
                className={activeTab === tab.title ? styles['active'] : ''}
              >
                <span className="material-symbols-rounded">{tab.icon}</span>
                <Label nowrap>{tab.title}</Label>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default Panel;
