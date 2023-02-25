import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  return (
    <div className={styles['progress-bar']}>
      <progress className={styles['progress']} value={value} max={100} />
      <label>{`${Math.round(value)}%`}</label>
    </div>
  );
};

export default ProgressBar;
