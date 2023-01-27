import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from 'src/components/Button';
import { useUserSessionDetails } from 'src/hooks';
import styles from './Polls.module.scss';

const Anonymous: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/signin');
  }, []);

  return (
    <div className={styles['anonymous-container']}>
      <p>Sign in to add this movie to a poll.</p>
      <Button
        outlined
        large
        onClick={(e) => {
          e.stopPropagation();
          router.push('/signin');
        }}
      >
        Sign in
      </Button>
    </div>
  );
};

const PollsEditor: React.FC = () => (
  <div className={styles['polls-editor']}></div>
);

interface PollsProps {}

const Polls: React.FC<PollsProps> = () => {
  const { isAuthenticated } = useUserSessionDetails();
  return (
    <div className={styles['polls']}>
      <div className={styles['polls-editor']}></div>
      {!isAuthenticated ? <Anonymous /> : null}
    </div>
  );
};

export default Polls;
