'use client';

import { useDate } from 'hooks';
import React, { useState } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  defaultValue?: string | number | null;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputType?: 'text' | 'date';
}

const Input: React.FC<InputProps> = ({
  placeholder,
  defaultValue,
  onChange,
  disabled,
  inputType,
}) => {
  const [active, setActive] = useState(
    defaultValue ? true : inputType === 'date' ? true : false
  );

  const [minDate] = useState(new Date().toISOString().slice(0, 16));

  const { getClientDateFromServerDate } = useDate();

  const [currentDate] = useState(
    getClientDateFromServerDate(
      (typeof defaultValue === 'string' &&
        inputType === 'date' &&
        defaultValue) ||
        new Date().toISOString()
    ).slice(0, 16)
  );

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
      {(typeof inputType === 'undefined' || inputType === 'text') && (
        <input
          disabled={disabled ?? false}
          defaultValue={(defaultValue as string | number | undefined) ?? ''}
          onChange={(ev) => {
            setActive(true);
            onChange(ev.target.value || '');
          }}
        />
      )}
      {inputType === 'date' && (
        <input
          type="datetime-local"
          disabled={disabled ?? false}
          defaultValue={currentDate}
          min={minDate}
          onChange={(ev) => {
            setActive(true);
            onChange(`${ev.target.value}:00.000Z` || '');
          }}
        />
      )}
    </div>
  );
};

export default Input;
