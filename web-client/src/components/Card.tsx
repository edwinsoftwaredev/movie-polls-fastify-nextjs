import style from './Card.module.scss';
import { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {}

const Card: React.FC<CardProps> = ({ children }) => {
  return <article className={`${style['card']}`}>{children}</article>;
};

export default Card;
