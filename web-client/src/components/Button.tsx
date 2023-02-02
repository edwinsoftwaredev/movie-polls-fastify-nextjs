import { MouseEvent, PropsWithChildren, useEffect, useReducer } from 'react';
import styles from './Button.module.scss';
import classNameReducer from './class-name-reducer';
interface ButtonProps extends PropsWithChildren {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  outlined?: boolean;
  large?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  outlined,
  large,
}) => {
  const classNames = `${styles['button']} ${
    outlined ? styles['outlined'] : ''
  } ${large ? styles['large'] : ''}`;

  return (
    <button onClick={onClick} className={classNames}>
      {children}
    </button>
  );
};

export default Button;
