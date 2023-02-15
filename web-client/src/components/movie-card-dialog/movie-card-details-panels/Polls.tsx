import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input, Label } from 'src/components';
import { useUserSessionDetails } from 'src/hooks';
import usePolls from 'src/hooks/usePolls';
import { Poll } from 'src/types/poll';
import { Movie } from 'types';
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

interface PollMovieListProps {
  movies: Poll['MoviePolls'];
  removeClbk: (movieId: Movie['id']) => void;
}

const PollMovieList: React.FC<PollMovieListProps> = ({
  movies,
  removeClbk,
}) => {
  return (
    <div className={styles['poll-movie-list']}>
      {!movies.length && <Label>No Movies</Label>}
      {movies.map((movie) => (
        <div key={movie.movieId} className={styles['poll-movie-list-item']}>
          <Label>{movie.movieId}</Label>
          <Button
            icon
            del
            onClick={() => {
              removeClbk(movie.movieId);
            }}
          >
            <span className="material-symbols-rounded">delete</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

interface InactivePollListProps {
  inactivePolls: Array<Poll>;
  movieId: Movie['id'];
}

const InactivePollList: React.FC<InactivePollListProps> = ({
  inactivePolls,
  movieId,
}) => {
  const { createPoll, isLoadingCreatePoll, isSuccessCreatePoll } = usePolls({
    fetchInactivePolls: true,
  });

  const [activePoll, setActivePoll] = useState<string | null>(null);
  const [pollName, setPollName] = useState<string>();
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    if (isSuccessCreatePoll) {
      setFormVersion((state) => state + 1);
    }
  }, [isSuccessCreatePoll]);

  return (
    <div className={styles['poll-list']}>
      {inactivePolls.length < 100 ? (
        <form
          className={styles['new-poll-form']}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (pollName && !isLoadingCreatePoll) {
              createPoll({ name: pollName, movieId });
            }
          }}
        >
          <h4>Create a new poll</h4>
          <div className={styles['new-poll-form-input']}>
            <Input
              onChange={(value) => {
                setPollName(value);
              }}
              placeholder="Poll Name"
              disabled={isLoadingCreatePoll}
              key={`poll-name-input-${formVersion}`}
            />
            <Button
              large
              outlined
              onClick={() => {}}
              disabled={isLoadingCreatePoll}
            >
              Add New Poll
            </Button>
          </div>
        </form>
      ) : null}
      <div className={styles['poll-list-container']}>
        <h4>Available Polls</h4>
        <div className={styles['poll-list-item-container']}>
          {inactivePolls.map((poll) => (
            <div key={poll.id}>
              <div
                className={`${activePoll === poll.id ? styles['active'] : ''} ${
                  styles['poll-list-item']
                }`}
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
                  <span
                    className={`${styles['expand-more-icon']} material-symbols-rounded`}
                  >
                    add
                  </span>
                </Button>
                <Button
                  icon
                  onClick={(e) => {
                    setActivePoll((state) =>
                      state !== poll.id ? poll.id : null
                    );
                  }}
                >
                  <span
                    className={`${styles['expand-more-icon']} material-symbols-rounded`}
                  >
                    expand_more
                  </span>
                </Button>
              </div>
              <div
                className={`${styles['poll-movie-list-container']} ${
                  activePoll === poll.id ? styles['active'] : ''
                }`}
              >
                <PollMovieList
                  key={poll.id}
                  movies={poll.MoviePolls}
                  removeClbk={(movieId) => {}}
                />
                <Button del large outlined onClick={() => {}}>
                  <span className="material-symbols-rounded">delete</span>
                  Delete Poll
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PollsProps {
  movieId: Movie['id'];
}

const Polls: React.FC<PollsProps> = ({ movieId }) => {
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
        <InactivePollList inactivePolls={inactivePolls} movieId={movieId} />
      )} */}
    </div>
  );
};

export default Polls;
