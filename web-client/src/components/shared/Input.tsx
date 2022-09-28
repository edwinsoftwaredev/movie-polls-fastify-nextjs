import React from 'react';

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChange }) => (
  <div>
    <span>{placeholder}</span>
    <input
      value={value || ''}
      onChange={(ev) => onChange(ev.target.value || '')}
    />
  </div>
);

export default Input;
