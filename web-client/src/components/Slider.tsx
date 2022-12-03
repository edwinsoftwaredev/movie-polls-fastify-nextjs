'use client';

import { AppContext } from 'app/AppProvider';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Movies } from 'types';
import Slide from './Slide';
import styles from './Slider.module.scss';

const aspectRatios = {
  '16/9': 16 / 9,
  '4/3': 4 / 3,
};

interface SliderProps {
  // TODO: Refactor
  items: Movies;
  slideSize: 3 | 4 | 5;
  slideItemsGap?: 7;
  slideItemAspectRatio?: '16/9' | '4/3';
  parentSize?: number;
}

const handleDivResize = (
  element: HTMLDivElement,
  setSize: Dispatch<SetStateAction<number>>
) => {
  setSize(element.clientWidth ?? 0);
};

const Slider: React.FC<SliderProps> = ({
  items,
  slideSize,
  slideItemsGap,
  slideItemAspectRatio,
  parentSize,
}) => {
  const appContext = useContext(AppContext);

  const sliderRef = useRef<HTMLDivElement>(null);

  const defaultSlideItemsGap = slideItemsGap || 7;
  const defaultSlideItemAspectRatio =
    aspectRatios[slideItemAspectRatio || '16/9'];

  const [sliderWidth, setSliderWidth] = useState(
    sliderRef.current?.clientWidth ?? 0
  );

  const sliderSize = sliderWidth;
  // A Slider control occupy 4% = sliderSize * (1 / 25) of the slider size
  const sliderCtrlSize = sliderSize * (1 / 25);

  const slideItemSize =
    (sliderSize - sliderCtrlSize * 2) / (slideSize || 1) -
    defaultSlideItemsGap / slideSize;

  const translateXSlide = sliderCtrlSize;

  useEffect(() => {
    if (typeof parentSize !== 'undefined')
      sliderRef.current && handleDivResize(sliderRef.current, setSliderWidth);
  }, [parentSize]);

  useEffect(() => {
    if (typeof parentSize === 'undefined') {
      sliderRef.current && handleDivResize(sliderRef.current, setSliderWidth);
    }
  }, [appContext.documentBodySize, parentSize]);

  return (
    <div ref={sliderRef} className={styles['slider']}>
      <div className="slider-interface">
        <div
          className="backward-ctrl slider-ctrl"
          style={{
            width: `${sliderCtrlSize}px`,
            margin: `${
              defaultSlideItemsGap * (1 / defaultSlideItemAspectRatio) * 0.5
            }px 0`,
          }}
        >
          <span>{'-'}</span>
        </div>
        <div />
        <div
          className="forward-ctrl slider-ctrl"
          style={{
            width: `${sliderCtrlSize}px`,
            margin: `${
              defaultSlideItemsGap * (1 / defaultSlideItemAspectRatio) * 0.5
            }px 0`,
          }}
        >
          <span>{'+'}</span>
        </div>
      </div>
      <div className="slide-container">
        <Slide
          items={items}
          itemSize={slideItemSize}
          slideItemsGap={defaultSlideItemsGap}
          translateX={translateXSlide}
          itemAspectRatio={defaultSlideItemAspectRatio}
        />
      </div>
    </div>
  );
};

export default Slider;
