import { PropsWithChildren, useState } from 'react';
import { Movies } from 'types';
import MovieCard from './MovieCard';
import style from './Slide.module.scss';

interface SlideProps extends PropsWithChildren {
  items: Movies;
  itemSize: number;
  translateX?: number;
  slideItemsGap: number;
}

const Slide: React.FC<SlideProps> = ({
  items,
  itemSize,
  slideItemsGap,
  translateX,
}) => {
  const itemWidth = `${itemSize}px`;
  const slideTranslateX = `translateX(${translateX || 0}px)`;

  const [posX, setPosX] = useState(0);

  return (
    <div
      className={`${style['slide']} slide`}
      style={{
        gap: slideItemsGap,
        transform: slideTranslateX,
        padding: `${0}px ${slideItemsGap}px`,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="slide-item"
          style={{
            width: itemWidth,
            // paddingRight: `${slideFlexGap}px`,
          }}
        >
          <MovieCard movie={item} />
        </div>
      ))}
    </div>
  );
};

export default Slide;
