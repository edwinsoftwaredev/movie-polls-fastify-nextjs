'use client';

import { createContext, PropsWithChildren, useRef } from "react";

export interface SliderCtrlEventType {
  type: 'backward' | 'forward',
}

interface SliderContextType {
  onCtrlClick: (sliderCtrlEvent: SliderCtrlEventType) => void; 
  addListener: (onSliderCtrlEv: (sliderCtrlEvent: SliderCtrlEventType) => void) => void;
}

export const SliderContext = createContext<SliderContextType>({
  onCtrlClick() {
  },
  addListener() {
  },
});

interface SliderProviderProps extends PropsWithChildren {}

const SliderProvider: React.FC<SliderProviderProps> = ({ children }) => {
  const listenerRef = useRef<Parameters<SliderContextType['addListener']>[0]>();

  return (
    <SliderContext.Provider 
      value={{
        onCtrlClick(ev) {
          listenerRef.current && listenerRef.current(ev);
        },
        addListener(onSliderCtrlEv) {
          listenerRef.current = onSliderCtrlEv;
        },
      }}
    >
      {children}
    </SliderContext.Provider>
  )
}

export default SliderProvider;
