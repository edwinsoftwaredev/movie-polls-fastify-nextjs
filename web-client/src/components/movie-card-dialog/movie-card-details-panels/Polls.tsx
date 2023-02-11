import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input, Label } from 'src/components';
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
  const { createPoll, isLoadingCreatePoll } = usePolls({
    fetchInactivePolls: false,
  });

  const [activePoll, setActivePoll] = useState<string | null>(null);
  const [pollName, setPollName] = useState<string>();

  return (
    <div className={styles['poll-list']}>
      {inactivePolls.length < 10 ? (
        <form
          className={styles['new-poll-input']}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (pollName && !isLoadingCreatePoll) {
              createPoll({ name: pollName });
            }
          }}
        >
          <h4>Create a new poll</h4>
          <Input
            onChange={(value) => {
              setPollName(value);
            }}
            placeholder="Poll Name"
            disabled={isLoadingCreatePoll}
          />
          <Button
            large
            outlined
            onClick={() => {}}
            disabled={isLoadingCreatePoll}
          >
            Add New Poll
          </Button>
        </form>
      ) : null}
      <div className={styles['poll-list-container']}>
        <h4>Available Polls</h4>
        <div className={styles['poll-list-item-container']}>
          {inactivePolls.map((poll) => (
            <div
              className={`${styles['poll-list-item']} ${
                activePoll === poll.id ? styles['active'] : ''
              }`}
              key={poll.id}
            >
              <span className={styles['poll-item-name']}>{poll.name}</span>
              <Button
                icon
                onClick={(e) => {
                  setActivePoll((state) =>
                    state !== poll.id ? poll.id : null
                  );
                }}
              >
                <span className="material-symbols-rounded">unfold_more</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
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
      <Anonymous />
      {/* {!isAuthenticated ? (
        <Anonymous />
      ) : (
        <InactivePollList inactivePolls={inactivePolls} />
      )} */}
    </div>
  );
};

export default Polls;
