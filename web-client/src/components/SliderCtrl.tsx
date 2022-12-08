'use client';

import { PropsWithChildren, useContext } from 'react';
import { SliderContext, SliderCtrlEventType } from './SliderProvider';
import style from './Slider.module.scss';

interface SliderCtrlProps extends PropsWithChildren {
  ctrlType: SliderCtrlEventType;
}

const SliderCtrl: React.FC<SliderCtrlProps> = ({ ctrlType, children }) => {
  const { onCtrlClick } = useContext(SliderContext);

  return (
    <button
      className={`${style['ctrl']}`}
      onClick={() => {
        onCtrlClick(ctrlType);
      }}
    >
      {children}
    </button>
  );
};

export default SliderCtrl;
