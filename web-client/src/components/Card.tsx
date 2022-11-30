import style from './Card.module.scss';
import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
}

const Card: React.FC<CardProps> = ({children}) => {
  return (
    <div 
      className={style['card']}
    >
      {children}
    </div>
  ); 
}

export default Card;
