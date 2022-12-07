'use client';

import { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { getInitialSliderProps } from 'src/utils/slider';
import { Movies } from 'types';
import MovieCard from './MovieCard';
import style from './Slide.module.scss';
import { SliderContext } from './SliderProvider';

interface SlideProps extends PropsWithChildren {
  items: Movies;
  slideSize: 3 | 4 | 5;
  translateX?: number;
  slideItemsGap?: 7;
  itemAspectRatio?: '16/9' | '4/3';
}

const Slide: React.FC<SlideProps> = ({
  items,
  slideSize,
  slideItemsGap,
  itemAspectRatio,
}) => {
  const { addListener } = useContext(SliderContext);
  type SliderCtrlEventType = Parameters<Parameters<typeof addListener>[0]>[0];

  const [slidePosX, setSlidePosX] = useState(0);

  const { translateXSlide, slideItemSize, sliderCtrlSize } =
    getInitialSliderProps(slideSize, slideItemsGap || 7);

  const slideTranslateX = `translate3d(calc(${translateXSlide || 0}%), 0, 0)`;

  useEffect(() => {
    addListener((ev: SliderCtrlEventType) => {
      setSlidePosX((state) => {
        if (ev.type === 'forward') return (state -= 1);
        return (state += 1);
      });
    });
  }, []);

  return (
    <div className={style['slide-container']}>
      <div
        className={`${style['slide']} slide`}
        style={{
          transform: slideTranslateX,
        }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="slide-item"
            style={{
              aspectRatio: '16 / 9',
              width: slideItemSize,
              paddingLeft: `${slideItemsGap}px`,
              ...(idx === items.length - 1
                ? {
                    marginRight: `${slideItemsGap}px`,
                  }
                : {}),
            }}
          >
            {/* TODO: pass itemAspectRatio to Card component */}
            {/* TODO: default cards in Slide to preview mode */}
            <MovieCard movie={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slide;
