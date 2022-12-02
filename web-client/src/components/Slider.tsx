'use client';

import { useEffect, useRef, useState } from 'react';
import { Movies } from 'types';
import Slide from './Slide';
import styles from './Slider.module.scss';

interface SliderProps {
  // TODO: Refactor
  items: Movies;
  slideSize: 3 | 5;
  slideItemsGap?: 7;
}

const Slider: React.FC<SliderProps> = ({ items, slideSize, slideItemsGap }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(
    sliderRef.current?.clientWidth ?? 0
  );
  const defaultSlideItemsGap = slideItemsGap || 7;

  useEffect(() => {
    // TODO: move it to the root component
    setSliderWidth(sliderRef.current?.clientWidth ?? 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSliderWidth(sliderRef.current?.clientWidth ?? 0);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // TODO: add listener or an alternative to a listener
  const sliderSize = sliderWidth;
  const sliderCtrlSize =
    sliderSize / ((slideSize || 1) * slideSize || 1) -
    defaultSlideItemsGap -
    defaultSlideItemsGap / items.length;
  const slideItemSize =
    (sliderSize - sliderCtrlSize * 2) / (slideSize || 1) -
    defaultSlideItemsGap -
    defaultSlideItemsGap / items.length;
  const translateXSlide = sliderCtrlSize;

  return (
    <div ref={sliderRef} className={styles['slider']}>
      <div className="slider-interface">
        <div
          className="backward-ctrl slider-ctrl"
          style={{
            width: `${sliderCtrlSize}px`,
          }}
        >
          <span>{'-'}</span>
        </div>
        <div />
        <div
          className="forward-ctrl slider-ctrl"
          style={{
            width: `${sliderCtrlSize}px`,
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
        />
      </div>
    </div>
  );
};

export default Slider;
