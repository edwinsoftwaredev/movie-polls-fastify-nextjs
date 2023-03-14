import { PropsWithChildren } from 'react';

interface SlideItem extends PropsWithChildren {}

const SlideItem: React.FC<SlideItem> = ({ children }) => {
  return <div className={'slide-item'}>{children}</div>;
};

export default SlideItem;
