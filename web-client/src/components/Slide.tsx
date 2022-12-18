'use client';

import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { Movies } from 'types';
import MovieCard from './MovieCard';
import style from './Slide.module.scss';
import { SliderContext } from './SliderProvider';

interface SlideProps extends PropsWithChildren {
  items: Movies;
  slideSize: 3 | 4 | 5;
}

const Slide: React.FC<SlideProps> = ({ items, slideSize }) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const { addListener } = useContext(SliderContext);
  type SliderCtrlEventType = Parameters<Parameters<typeof addListener>[0]>[0];

  useEffect(() => {
    addListener((ev: SliderCtrlEventType) => {
      if (slideRef.current) {
        slideRef.current.scrollBy({
          behavior: 'smooth',
          left:
            ev.type === 'forward'
              ? slideRef.current.clientWidth
              : -slideRef.current.clientWidth,
        });
      }
    });
  }, []);

  return (
    <div
      ref={slideRef}
      // TODO: defined the slide size using css variables
      className={`${style['slide']} ${style[`slide-s-${slideSize}`]}`}
    >
      {items.map((item) => (
        <div key={item.id} className="slide-item">
          {/* TODO: pass itemAspectRatio to Card component */}
          {/* TODO: default cards in Slide to preview mode */}
          <MovieCard movie={item} />
        </div>
      ))}
    </div>
  );
};

export default Slide;
