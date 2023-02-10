'use client';

import React, { useState } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChange }) => {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`${styles['input']} ${active ? styles['active'] : ''}`}
      onClick={(e) => {
        setActive(true);
        e.stopPropagation();
      }}
    >
      <div className={styles['label']}>{placeholder}</div>
      <input
        defaultValue={value}
        onChange={(ev) => {
          setActive(true);
          onChange(ev.target.value || '');
        }}
      />
    </div>
  );
};

export default Input;
