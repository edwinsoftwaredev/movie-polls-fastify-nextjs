import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
            title="Remove movie"
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

interface PollItemControlsProps {
  movieId: Movie['id'];
  poll: Poll;
  onAddMovie: () => void;
  onExpandMore: () => void;
}

const PollItemControls: React.FC<PollItemControlsProps> = ({
  movieId,
  poll,
  onAddMovie,
  onExpandMore,
}) => {
  const isMovieInPoll = useMemo(
    () =>
      poll.MoviePolls.find((moviePoll) => {
        return moviePoll.movieId === movieId;
      }),
    [movieId, poll.MoviePolls]
  );

  return (
    <>
      <span className={styles['poll-item-name']}>{poll.name}</span>
      {poll.MoviePolls.length < 5 && !isMovieInPoll ? (
        <Button
          icon
          title="Add movie to this poll"
          onClick={() => {
            onAddMovie();
          }}
        >
          <span
            className={`${styles['expand-more-icon']} material-symbols-rounded`}
          >
            add
          </span>
        </Button>
      ) : null}
      <Button
        icon
        onClick={(e) => {
          onExpandMore();
        }}
      >
        <span
          className={`${styles['expand-more-icon']} material-symbols-rounded`}
        >
          expand_more
        </span>
      </Button>
    </>
  );
};

interface PollItemProps {
  movieId: Movie['id'];
  poll: Poll;
  isActive: boolean;
  onSelect: (pollId: Poll['id']) => void;
}

const PollItem: React.FC<PollItemProps> = ({
  movieId,
  poll,
  isActive,
  onSelect,
}) => {
  const { addMovie, removeMovie, removePoll } = usePolls({
    fetchInactivePolls: false,
  });

  const addMovieClbk = useCallback(() => {
    !isActive && onSelect(poll.id);
    addMovie({ movieId, pollId: poll.id });
  }, [movieId, poll.id, isActive]);

  const onExpandMoreClbk = useCallback(() => {
    onSelect(poll.id);
  }, [poll.id]);

  const removeMovieClbk = useCallback(
    (movieId: Movie['id']) => {
      removeMovie({ movieId, pollId: poll.id });
    },
    [poll.id]
  );

  const removePollClbk = useCallback(() => {
    removePoll({ pollId: poll.id });
  }, [poll.id]);

  return (
    <div>
      <div
        className={`${isActive ? styles['active'] : ''} ${
          styles['poll-list-item']
        }`}
      >
        <PollItemControls
          poll={poll}
          movieId={movieId}
          onAddMovie={addMovieClbk}
          onExpandMore={onExpandMoreClbk}
        />
      </div>
      <div
        className={`${styles['poll-movie-list-container']} ${
          isActive ? styles['active'] : ''
        }`}
      >
        <PollMovieList
          key={poll.id}
          movies={poll.MoviePolls}
          removeClbk={removeMovieClbk}
        />
        <Button del large outlined onClick={removePollClbk}>
          <span className="material-symbols-rounded">delete</span>
          Delete Poll
        </Button>
      </div>
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

  const onPollSelectClbk = useCallback((pollId: Poll['id']) => {
    setActivePoll((state) => (state !== pollId ? pollId : null));
  }, []);

  useEffect(() => {
    if (isSuccessCreatePoll) {
      setFormVersion((state) => state + 1);
    }
  }, [isSuccessCreatePoll]);

  return (
    <div className={styles['poll-list']}>
      {inactivePolls.length < 10 ? (
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
            <Button type="submit" large outlined disabled={isLoadingCreatePoll}>
              Add New Poll
            </Button>
          </div>
        </form>
      ) : null}
      {inactivePolls.length ? (
        <div className={styles['poll-list-container']}>
          <h4>Available Polls</h4>
          <div className={styles['poll-list-item-container']}>
            {inactivePolls.map((poll) => (
              <PollItem
                key={poll.id}
                poll={poll}
                movieId={movieId}
                isActive={poll.id === activePoll}
                onSelect={onPollSelectClbk}
              />
            ))}
          </div>
        </div>
      ) : null}
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
