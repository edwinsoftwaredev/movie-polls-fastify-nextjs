import { MouseEvent, PropsWithChildren } from 'react';
import styles from './Button.module.scss';
interface ButtonProps extends PropsWithChildren {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outlined?: boolean;
  large?: boolean;
  icon?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled,
  children,
  outlined,
  large,
  icon,
}) => {
  const classNames = `${styles['button']} ${
    outlined ? styles['outlined'] : ''
  } ${large ? styles['large'] : ''} ${icon ? styles['icon'] : ''} ${
    disabled ? styles['disabled'] : ''
  }`;

  return (
    <button
      onClick={onClick}
      className={classNames}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
};

export default Button;
