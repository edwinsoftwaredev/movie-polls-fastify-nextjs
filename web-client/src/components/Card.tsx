import style from './Card.module.scss';
import { forwardRef, PropsWithChildren } from 'react';
import Image from 'next/image';

interface CardProps extends PropsWithChildren {
  // TODO: Refactor
  header: {
    content: React.ReactElement;
    backdropImage?: React.ReactElement<HTMLImageElement | typeof Image>;
  };
  aspectRatio?: number;
}

const Card = forwardRef<HTMLElement, CardProps>(({ header, children }, ref) => {
  const { content, backdropImage } = header;
  return (
    <article ref={ref} className={`${style['card']}`}>
      <header className="title">
        {content}
        {backdropImage}
      </header>
    </article>
  );
});

export default Card;
