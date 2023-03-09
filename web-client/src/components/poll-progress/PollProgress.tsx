import ProgressBar from '../ProgressBar';
import styles from './PollProgress.module.scss';

const PollProgress: React.FC<{
  type: 'movie' | 'poll';
  value?: number;
  maxValue?: number;
  progress?: number;
  hideTitle?: boolean;
}> = ({ value, maxValue, type, progress, hideTitle }) => {
  return (
    <div
      className={`${styles['poll-progress']} ${
        !hideTitle ? styles['showTitle'] : ''
      }`}
    >
      {!hideTitle ? (
        <span>{`${type === 'poll' ? 'Poll Progress' : 'Progress'}`}</span>
      ) : null}
      <ProgressBar
        value={
          typeof progress !== 'undefined'
            ? progress
            : Math.round(((value ?? 0) / (maxValue ?? 1)) * 100)
        }
        label={`${
          typeof progress !== 'undefined'
            ? `${progress}%`
            : `${value}/${maxValue}`
        }`}
      />
    </div>
  );
};

export default PollProgress;
