import { PropsWithChildren, Suspense } from 'react';
import { Movies } from 'types';
import styles from './Slider.module.scss';
import SlideSkeleton from './SlideSkeleton';
import Slide from './Slide';
import SliderProvider from './SliderProvider';
import SliderCtrl from './SliderCtrl';

interface SliderProps extends PropsWithChildren {
  // TODO: create SliderItem type
  fetchItems: () => Promise<Movies>;
  slideSize: 3 | 4 | 5;
  slideItemsGap?: 7;
  slideItemAspectRatio?: '16/9' | '4/3';
  title?: string;
}

const Slider: React.FC<SliderProps> = ({
  fetchItems,
  slideSize,
  slideItemAspectRatio,
  slideItemsGap,
  title,
}) => {
  const RenderSlide = async () => {
    const items = await fetchItems();

    return <Slide items={items} slideSize={slideSize} />;
  };

  return (
    <SliderProvider>
      <div className={`${styles['slider']}`}>
        <div className={`${styles['title']}`}>
          {title ? <h2>{title}</h2> : null}
        </div>
        <div className="slider-interface">
          <div
            className="backward-ctrl slider-ctrl"
            style={{
              width: `100%`,
            }}
          >
            <SliderCtrl
              ctrlType={{
                type: 'backward',
              }}
            />
          </div>
          <div className={styles['slide-container']}>
            <Suspense fallback={<SlideSkeleton slideSize={slideSize} />}>
              {/* @ts-expect-error Server Component */}
              <RenderSlide />
            </Suspense>
          </div>
          <div
            className="forward-ctrl slider-ctrl"
            style={{
              width: `100%`,
            }}
          >
            <SliderCtrl
              ctrlType={{
                type: 'forward',
              }}
            />
          </div>
        </div>
      </div>
    </SliderProvider>
  );
};

export default Slider;
