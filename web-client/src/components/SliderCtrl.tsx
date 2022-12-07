'use client';

import { PropsWithChildren, useContext } from "react";
import { SliderContext, SliderCtrlEventType } from "./SliderProvider";

interface SliderCtrlProps extends PropsWithChildren {
  ctrlType: SliderCtrlEventType;
}

const SliderCtrl: React.FC<SliderCtrlProps> = ({
  ctrlType,
  children
}) => {
  const { onCtrlClick } = useContext(SliderContext);

  return (
    <button
      onClick={() => {
        onCtrlClick(ctrlType);
      }}
    >
      {children}
    </button>
  );
}

export default SliderCtrl;
