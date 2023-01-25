'use client';

import { PropsWithChildren, useContext } from 'react';
import { SliderContext, SliderCtrlEventType } from './SliderProvider';
import styles from './SliderCtrl.module.scss';

interface SliderCtrlProps extends PropsWithChildren {
  ctrlType: SliderCtrlEventType;
}

const SliderCtrl: React.FC<SliderCtrlProps> = ({ ctrlType, children }) => {
  const { onCtrlClick } = useContext(SliderContext);

  return (
    <button
      className={`${styles['ctrl']} ${styles[`${ctrlType.type}`]}`}
      onClick={() => {
        onCtrlClick(ctrlType);
      }}
    >
      {ctrlType.type === 'backward' ? (
        <span
          className="material-symbols-rounded"
          style={{
            rotate: '180deg',
          }}
        >
          chevron_right
        </span>
      ) : (
        <span className="material-symbols-rounded">chevron_right</span>
      )}
    </button>
  );
};

export default SliderCtrl;
