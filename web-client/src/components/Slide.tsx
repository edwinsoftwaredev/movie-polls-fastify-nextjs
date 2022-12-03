import { PropsWithChildren, useState } from 'react';
import { Movies } from 'types';
import MovieCard from './MovieCard';
import style from './Slide.module.scss';

interface SlideProps extends PropsWithChildren {
  items: Movies;
  itemSize: number;
  translateX?: number;
  slideItemsGap: number;
  itemAspectRatio: number;
}

const Slide: React.FC<SlideProps> = ({
  items,
  itemSize,
  slideItemsGap,
  translateX,
  itemAspectRatio
}) => {
  const slideTranslateX = `translateX(${translateX || 0}px)`;

  const [posX, setPosX] = useState(0);

  return (
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
            width: itemSize,
            paddingLeft: idx === 0 || idx !== items.length - 1 ? `${slideItemsGap}px` : '0',
            paddingRight: idx === 1 && idx === items.length - 1 ? `${slideItemsGap}px` : '0'
          }}
        >
          {/* TODO: pass itemAspectRatio to Card component */}
          {/* TODO: default cards in Slide to preview mode */}
          <MovieCard movie={item} />
        </div>
      ))}
    </div>
  );
};

export default Slide;
