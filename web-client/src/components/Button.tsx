import { ButtonHTMLAttributes, MouseEvent, PropsWithChildren } from 'react';
import styles from './Button.module.scss';
interface ButtonProps extends PropsWithChildren {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
  outlined?: boolean;
  large?: boolean;
  icon?: boolean;
  del?: boolean;
  warn?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  onPointerDown,
  type,
  title,
  disabled,
  children,
  outlined,
  large,
  icon,
  del,
  warn,
}) => {
  const classNames = `${styles['button']} ${
    outlined ? styles['outlined'] : ''
  } ${large ? styles['large'] : ''} ${icon ? styles['icon'] : ''} ${
    disabled ? styles['disabled'] : ''
  } ${del ? styles['delete'] : ''} ${warn ? styles['warn'] : ''}`;

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={classNames}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
};

export default Button;
