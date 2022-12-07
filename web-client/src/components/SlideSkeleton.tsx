import { getInitialSliderProps } from 'src/utils/slider';
import Card from './Card';
import style from './Slide.module.scss';

interface SlideSkeletonProps {
  slideSize: 3 | 4 | 5;
  slideItemsGap?: 7;
}

const SlideSkeleton: React.FC<SlideSkeletonProps> = ({
  slideSize,
  slideItemsGap,
}) => {
  const defaultItemSlideItemGap = slideItemsGap || 7;

  const { translateXSlide, slideItemSize } = getInitialSliderProps(
    slideSize,
    defaultItemSlideItemGap
  );

  const items = new Array(slideSize).fill(0);

  return (
    <div className={style['slide-container']}>
      <div
        className={`${style['slide']} slide`}
        style={{
          transform: `translateX(${translateXSlide || 0}%)`,
        }}
      >
        {items.map((_item, idx) => (
          <div
            key={idx}
            className="slide-item"
            style={{
              aspectRatio: '16 / 9',
              width: slideItemSize,
              paddingLeft: `${defaultItemSlideItemGap}px`,
              ...(idx === items.length - 1
                ? {
                    marginRight: `${defaultItemSlideItemGap}px`,
                  }
                : {}),
            }}
          >
            <Card />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideSkeleton;
