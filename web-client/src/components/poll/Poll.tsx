'use client';

import { useDate, useMovie, usePolls } from 'hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import trpc from 'src/trpc/client';
import { Poll, Poll as PollType } from 'types';
import Button from '../Button';
import Card from '../Card';
import Input from '../Input';
import MovieDetails from '../movie-details/MovieDetails';
import MovieBackdrop from '../movie-images/MovieBackdrop';
import MoviePanels from '../movie-panels/MoviePanels';
import ProgressBar from '../ProgressBar';
import styles from './Poll.module.scss';

const Movie: React.FC<{
  id: Poll['MoviePolls']['0']['movieId'];
  onRemove?: (movieId: number) => void;
  progress?: number;
}> = ({ id, onRemove, progress }) => {
  const { movie, isLoading } = useMovie({ movieId: id });

  if (isLoading || !movie) return null;

  return (
    <div className={styles['movie']}>
      <Card
        header={{
          backdropImage: <MovieBackdrop movie={movie} isBackdrop />,
        }}
      >
        <div className={styles['backdrop-shadow']} />
        <div className={styles['movie-details']}>
          <MovieDetails movie={movie} />
          <div className={styles['movie-actions']}>
            <MoviePanels movie={movie} hidePollsTab defaultTab="Available On" />
            {!!onRemove && (
              <Button
                onClick={() => {
                  onRemove(movie.id);
                }}
                del
                type="button"
              >
                REMOVE
              </Button>
            )}
            {typeof progress !== 'undefined' && (
              <div className={styles['poll-progress']}>
                <span>Progress</span>
                <ProgressBar value={50} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const MovieList: React.FC<{
  movies: Poll['MoviePolls'];
  onRemove?: (movieId: number) => void;
  pollVotes?: number;
}> = ({ movies, onRemove, pollVotes }) => {
  return (
    <section className={styles['movie-list']}>
      {movies.map((movie) => (
        <Movie
          key={movie.movieId}
          id={movie.movieId}
          onRemove={onRemove}
          progress={typeof pollVotes !== 'undefined' ? 50 : undefined}
        />
      ))}
    </section>
  );
};

const ActivePoll: React.FC<{
  poll: PollType;
  onUpdate: (
    ...args: Parameters<ReturnType<typeof usePolls>['updatePoll']>
  ) => void;
}> = ({ poll, onUpdate }) => {
  const [endsOn, setEndsOn] = useState('');

  useEffect(() => {
    setEndsOn(
      poll.expiresOn
        ? new Date(poll.expiresOn).toLocaleString(undefined, {
            dateStyle: 'long',
            timeStyle: 'short',
          })
        : ''
    );
  }, [poll.expiresOn]);

  return (
    <article className={styles['active-poll']}>
      <header className={styles['header']}>
        <form>
          <Button
            outlined
            onClick={() => {
              onUpdate({
                ...poll,
                expiresOn: new Date(poll.expiresOn!),
                isActive: false,
              });
            }}
            type="button"
          >
            CLOSE POLL
          </Button>
          <h2>{`${poll.name}`}</h2>
          <div />
          <div className={styles['poll-progress']}>
            <span>Poll Progress</span>
            <ProgressBar value={50} />
          </div>
          <div className={styles['poll-end-date']}>
            {!!endsOn && (
              <>
                <span>Ends On: </span>
                <span>{endsOn}</span>
              </>
            )}
          </div>
        </form>
      </header>
      <MovieList movies={poll.MoviePolls} pollVotes={1} />
    </article>
  );
};

const InactivePoll: React.FC<{
  poll: PollType;
  onRemoveMovie: (movieId: number) => void;
  onUpdate: (
    ...args: Parameters<ReturnType<typeof usePolls>['updatePoll']>
  ) => void;
}> = ({ poll, onRemoveMovie, onUpdate }) => {
  const { getServerDateFromClientDate } = useDate();
  const [pollName, setPollName] = useState(poll.name);
  const [endDate, setEndDate] = useState(
    poll.expiresOn || new Date().toISOString()
  );

  return (
    <article className={styles['inactive-poll']}>
      <header className={styles['header']}>
        <form>
          <Button
            onClick={() => {
              if (poll.MoviePolls.length < 2) return;

              // NOTE: If the property MoviePolls is not removed
              // there will be no type error or warning.
              const { MoviePolls, ...rest } = poll;

              onUpdate({
                ...rest,
                // NOTE: the time part of a Date is local
                expiresOn: new Date(endDate),
                name: pollName,
                isActive: true,
              });
            }}
            disabled={poll.MoviePolls.length < 2}
            outlined
            type="button"
          >
            START POLL
          </Button>
          <Input
            defaultValue={poll.name}
            placeholder="Poll Name"
            onChange={(val) => {
              setPollName(val);
            }}
            inputType="text"
          />
          <div />
          <Input
            defaultValue={endDate}
            placeholder="End Date"
            onChange={(val) => {
              setEndDate(getServerDateFromClientDate(val));
            }}
            inputType="date"
          />
        </form>
      </header>
      <MovieList
        movies={poll.MoviePolls}
        onRemove={(movieId) => {
          // TODO: update only on success
          onRemoveMovie(movieId);
        }}
      />
    </article>
  );
};

interface PollProps {
  poll: PollType;
  // TODO: add votes
}

const Poll: React.FC<PollProps> = ({ poll }) => {
  const router = useRouter();
  const { removeMovie, updatePoll, isSuccessUpdatePoll, isSuccessRemoveMovie } =
    usePolls({});

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    isSuccessUpdatePoll &&
      startTransition(() => {
        router.refresh();
      });
  }, [isSuccessUpdatePoll]);

  useEffect(() => {
    isSuccessRemoveMovie &&
      startTransition(() => {
        router.refresh();
      });
  }, [isSuccessRemoveMovie]);

  return (
    <section className={styles['poll']}>
      {poll.isActive ? (
        <ActivePoll
          poll={poll}
          onUpdate={(p) => {
            updatePoll(p);
          }}
        />
      ) : (
        <InactivePoll
          poll={poll}
          onRemoveMovie={(movieId) => {
            removeMovie({ movieId, pollId: poll.id });
          }}
          onUpdate={(p) => {
            updatePoll(p);
          }}
        />
      )}
    </section>
  );
};

export default Poll;
