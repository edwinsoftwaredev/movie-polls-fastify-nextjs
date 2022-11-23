import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => (
  <div>
    <button onClick={onClick}>{text}</button>
  </div>
);

export default Button;
