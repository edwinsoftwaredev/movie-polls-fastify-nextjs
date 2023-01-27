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
  const [classNames, dispatch] = useReducer(
    classNameReducer,
    `${styles['button']} ${outlined ? styles['outlined'] : ''} ${
      large ? styles['large'] : ''
    }`
  );

  useEffect(() => {
    dispatch({
      type: outlined ? 'add' : 'remove',
      className: styles['outlined'],
    });
    dispatch({
      type: large ? 'add' : 'remove',
      className: styles['large'],
    });
  }, [outlined, large]);

  return (
    <button onClick={onClick} className={classNames}>
      {children}
    </button>
  );
};
export default Button;
