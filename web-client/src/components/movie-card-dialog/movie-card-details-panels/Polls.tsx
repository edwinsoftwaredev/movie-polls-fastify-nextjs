import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from 'src/components/Button';
import Input from 'src/components/Input';
import { useUserSessionDetails } from 'src/hooks';
import usePolls from 'src/hooks/usePolls';
import { Poll } from 'src/types/poll';
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

interface InactivePollListProps {
  inactivePolls: Array<Poll>;
}

const InactivePollList: React.FC<InactivePollListProps> = ({
  inactivePolls,
}) => {
  return (
    <div className={styles['poll-list']}>
      {inactivePolls.length < 10 ? (
        <Input onChange={(value) => {}} placeholder="New poll name" />
      ) : null}
    </div>
  );
};

interface PollsProps {}

const Polls: React.FC<PollsProps> = () => {
  const { isAuthenticated } = useUserSessionDetails();

  const { inactivePolls } = usePolls({
    fetchInactivePolls: false,
  });

  return (
    <div className={styles['polls']}>
      {!isAuthenticated ? (
        <Anonymous />
      ) : (
        <InactivePollList inactivePolls={inactivePolls} />
      )}
    </div>
  );
};

export default Polls;
