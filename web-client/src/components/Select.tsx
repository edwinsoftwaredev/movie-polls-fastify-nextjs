interface SelectProps {
  options: Array<{
    value: string | number;
    title: string;
  }>;
  selectedValue?: string | number;
  onOptionClick?: (value: string | number) => {};
}

const Select: React.FC<SelectProps> = ({ options, selectedValue }) => {
  return (
    <select value={selectedValue}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.title}
        </option>
      ))}
    </select>
  );
};

export default Select;
