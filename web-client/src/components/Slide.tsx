'use client';

import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { Movies } from 'types';
import MovieCard from './movie-card/MovieCard';
import style from './Slide.module.scss';
import { SliderContext } from './SliderProvider';

interface SlideProps extends PropsWithChildren {
  slideSize: 3 | 4 | 5;
}

const Slide: React.FC<SlideProps> = ({ slideSize, children }) => {
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
              ? slideRef.current.getBoundingClientRect().width
              : -slideRef.current.getBoundingClientRect().width,
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
      {children}
    </div>
  );
};

export default Slide;
