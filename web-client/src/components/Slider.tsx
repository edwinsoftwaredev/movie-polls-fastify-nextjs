import { PropsWithChildren } from 'react';
import styles from './Slider.module.scss';
import SliderProvider from './SliderProvider';
import SliderCtrl from './SliderCtrl';

interface SliderProps extends PropsWithChildren {
  title?: string;
}

const Slider: React.FC<SliderProps> = ({ title, children }) => {
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
          <div className={styles['slide-container']}>{children}</div>
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
