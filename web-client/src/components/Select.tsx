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
  return (
    <div className={styles['select']}>
      <div className={styles['select-list']}>
        {options.map((opt) => (
          <div key={opt.value} className={styles['option']}>
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
