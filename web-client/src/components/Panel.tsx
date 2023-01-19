'use client';

import { PropsWithChildren } from 'react';
import styles from './Panel.module.scss';

interface PanelProps extends PropsWithChildren {
  tabs?: Array<{title: string, icon: 'image' | 'streamingOn' | 'availableOn' | 'pollStats'}>
  onTabClick: (tabTitle: string) => void;
}

const Panel: React.FC<PanelProps> = ({ tabs, onTabClick, children }) => {
  return (
    <div className={styles['panel']}>
      <div className={styles['children']}>
        <div className={styles['children-container']}>
          {children}
        </div>
      </div>
      {
        tabs?.length ? (
          <ul className={styles['panel-tabs']}>
            {tabs.map(tab => (
              <li key={tab.title}>
                <button
                  onClick={() => {
                    onTabClick(tab.title);
                  }}
                >
                  <span>{tab.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null
      }
    </div>
  );
}

export default Panel;
