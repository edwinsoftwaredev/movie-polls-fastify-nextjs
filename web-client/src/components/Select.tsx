'use client';

import { useState } from 'react';
import styles from './Select.module.scss';

interface SelectProps {
  options: Array<{
    value: string | number;
    title: string;
  }>;
  defaultValue?: string | number;
  onOptionClick?: (value: string | number) => void;
}

const Select: React.FC<SelectProps> = ({
  options,
  defaultValue,
  onOptionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={styles['select']}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}
      role="combobox"
      aria-haspopup="listbox"
      tabIndex={0}
      onBlur={() => {
        setIsOpen(false);
      }}
    >
      <div
        className={`${styles['select-list']} ${isOpen ? styles['open'] : ''}`}
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            className={styles['option']}
            onClick={() => {
              onOptionClick && onOptionClick(opt.value);
              setIsOpen(false);
            }}
            role="option"
            aria-selected={defaultValue === opt.value}
          >
            {opt.title}
          </div>
        ))}
      </div>
      <div className={styles['value']}>{`${defaultValue}'s`}</div>
      <div className={styles['icon']}>
        <span className={`material-symbols-rounded`}>chevron_left</span>
      </div>
    </div>
  );
};

export default Select;
