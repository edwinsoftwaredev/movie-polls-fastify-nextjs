import style from './Card.module.scss';
import { forwardRef, PropsWithChildren } from 'react';
import Image from 'next/image';

interface CardProps extends PropsWithChildren {
  // TODO: Refactor
  header: {
    content?: React.ReactElement;
    backdropImage?: React.ReactElement<HTMLImageElement | typeof Image>;
  };
  aspectRatio?: number;
  contrast?: 'dark' | 'light';
}

const Card = forwardRef<HTMLElement, CardProps>(
  ({ header, children, contrast }, ref) => {
    const { content, backdropImage } = header;
    return (
      <article
        ref={ref}
        className={`${style['card']} ${style[contrast || '']}`}
      >
        <header className="card-header">
          {content}
          {backdropImage}
        </header>
        <section>{children}</section>
      </article>
    );
  }
);

Card.displayName = 'Card';

export default Card;
