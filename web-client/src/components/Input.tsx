'use client';

import { useDate } from 'hooks';
import React, { useState } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  defaultValue?: string | number | null;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputType?: 'text' | 'date' | 'number';
  minValue?: string | number | Date;
  maxValue?: string | number | Date;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  defaultValue,
  onChange,
  disabled,
  inputType,
  minValue,
  maxValue,
}) => {
  const [active, setActive] = useState(
    typeof defaultValue !== 'undefined'
      ? true
      : inputType === 'date'
      ? true
      : false
  );

  const { getClientDateFromServerDate } = useDate();

  const [minDate] = useState(
    getClientDateFromServerDate(new Date().toISOString()).slice(0, 16)
  );

  const [maxDate] = useState(
    maxValue instanceof Date ? maxValue.toISOString().slice(0, 16) : null
  );

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
          max={maxDate ?? undefined}
          onChange={(ev) => {
            setActive(true);
            onChange(`${ev.target.value}:00.000Z` || '');
          }}
        />
      )}
      {inputType === 'number' && (
        <input
          type="number"
          disabled={disabled ?? false}
          defaultValue={defaultValue ?? 0}
          min={minValue as number | undefined}
          max={maxValue as number | undefined}
          onChange={(ev) => {
            setActive(true);
            onChange(ev.target.value);
          }}
        />
      )}
    </div>
  );
};

export default Input;
