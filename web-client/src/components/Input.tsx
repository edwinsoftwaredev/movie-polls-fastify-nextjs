'use client';

import React, { useState } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  defaultValue?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  defaultValue,
  onChange,
  disabled,
}) => {
  const [active, setActive] = useState(false);
  return (
    <div
      className={`${styles['input']} ${active ? styles['active'] : ''} ${
        disabled ? styles['disabled'] : ''
      }`}
      onClick={(e) => {
        setActive(true);
        e.stopPropagation();
      }}
    >
      <div className={styles['label']}>{placeholder}</div>
      <input
        disabled={disabled ?? false}
        defaultValue={defaultValue ?? ''}
        onChange={(ev) => {
          setActive(true);
          onChange(ev.target.value || '');
        }}
      />
    </div>
  );
};

export default Input;
