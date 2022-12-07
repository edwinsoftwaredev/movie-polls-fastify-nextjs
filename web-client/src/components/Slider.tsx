import { PropsWithChildren, Suspense } from 'react';
import { getInitialSliderProps } from 'src/utils/slider';
import { Movies } from 'types';
import styles from './Slider.module.scss';
import SlideSkeleton from './SlideSkeleton';
import Slide from './Slide';
import SliderProvider from './SliderProvider';
import SliderCtrl from './SliderCtrl';

interface SliderProps extends PropsWithChildren {
  // TODO: Refactor
  fetchItems: () => Promise<Movies>;
  slideSize: 3 | 4 | 5;
  slideItemsGap?: 7;
  slideItemAspectRatio?: '16/9' | '4/3';
}

const Slider: React.FC<SliderProps> = ({
  fetchItems,
  slideSize,
  slideItemAspectRatio,
  slideItemsGap,
}) => {
  const { sliderCtrlSize, translateXSlide } = getInitialSliderProps(
    slideSize,
    slideItemsGap,
    slideItemAspectRatio
  );

  const RenderSlide = async () => {
    const items = await fetchItems();

    return (
      <Slide
        items={items}
        slideSize={slideSize}
        slideItemsGap={slideItemsGap || 7}
        translateX={translateXSlide}
      />
    );
  };

  return (
    <SliderProvider>
      <div className={`${styles['slider']}`}>
        <div
          className="slider-interface"
          style={{
            gridTemplateColumns: `${sliderCtrlSize}% 1fr ${sliderCtrlSize}%`,
          }}
        >
          <div
            className="backward-ctrl slider-ctrl"
            style={{
              width: `100%`,
            }}
          >
            <SliderCtrl 
              ctrlType={{
                type: 'backward'
              }}
            >
              <span>{'-'}</span>
            </SliderCtrl>
          </div>
          <div />
          <div
            className="forward-ctrl slider-ctrl"
            style={{
              width: `100%`,
            }}
          >
            <SliderCtrl 
              ctrlType={{
                type: 'forward'
              }}
            >
              <span>{'+'}</span>
            </SliderCtrl>
          </div>
        </div>
        <Suspense fallback={<SlideSkeleton slideSize={slideSize} />}>
          {/* @ts-expect-error Server Component */}
          <RenderSlide />
        </Suspense>
      </div>
    </SliderProvider>
  );
};

export default Slider;
