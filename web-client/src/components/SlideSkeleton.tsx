import Card from './Card';
import style from './Slide.module.scss';

interface SlideSkeletonProps {
  slideSize: 3 | 4 | 5;
}

const SlideSkeleton: React.FC<SlideSkeletonProps> = ({ slideSize }) => {
  const items = new Array(slideSize).fill(0);

  return (
    <div className={`${style['slide']} ${style[`slide-s-${slideSize}`]}`}>
      {items.map((_item, idx) => (
        <div key={idx} className="slide-item">
          <Card header={{ content: <></> }} />
        </div>
      ))}
    </div>
  );
};

export default SlideSkeleton;
