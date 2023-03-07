import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
  return (
    <div className={styles['progress-bar']}>
      <progress className={styles['progress']} value={value} max={100} />
      <label>{label ? label : `${Math.round(value)}%`}</label>
    </div>
  );
};

export default ProgressBar;
