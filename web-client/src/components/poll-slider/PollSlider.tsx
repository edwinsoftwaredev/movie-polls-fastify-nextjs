'use client';

import { useMovie } from 'hooks';
import { Poll } from 'src/types/poll';
import Card from '../Card';
import styles from './PollSlider.module.scss';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'app/AppProvider';
import Button from '../Button';
import ProgressBar from '../ProgressBar';
import { useRouter } from 'next/navigation';
import MovieBackdrop from '../movie-images/MovieBackdrop';

const MoviePoll: React.FC<{
  moviePoll: Poll['MoviePoll']['0'];
}> = ({ moviePoll }) => {
  const { movie, isLoading } = useMovie({ movieId: moviePoll.movieId });
  if (isLoading || !movie) return <div className={styles['movie-container']} />;

  return (
    <div className={styles['movie-container']}>
      <MovieBackdrop movie={movie} isPoster />
    </div>
  );
};

const PollCardHeader: React.FC<{ poll: Poll }> = ({ poll }) => {
  const [expiresOn, setExpiresOn] = useState('');

  useEffect(() => {
    poll.expiresOn &&
      setExpiresOn(
        new Date(poll.expiresOn).toLocaleString(undefined, {
          dateStyle: 'long',
          timeStyle: 'short',
        })
      );
  }, [poll.expiresOn]);

  return (
    <div className={styles['poll-card-header']}>
      <div className={styles['title-expire-date']}>
        <h3>{poll.name}</h3>
        <div className={styles['expire-on-date']}>{expiresOn}</div>
      </div>
      <div className={styles['poll-progress']}>
        <ProgressBar value={50} />
      </div>
    </div>
  );
};

const PollCard: React.FC<{ poll: Poll }> = ({ poll }) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(`/polls/${poll.id}`);
  }, [poll]);

  return (
    <div key={poll.id} className={styles['poll-card']}>
      <Card
        contrast={'dark'}
        header={{ content: <PollCardHeader poll={poll} /> }}
      >
        <div className={styles['movie-poll-container']}>
          {poll.MoviePoll.slice(0, 3).map((moviePoll) => (
            <MoviePoll
              key={`${moviePoll.movieId}-${moviePoll.pollId}`}
              moviePoll={moviePoll}
            />
          ))}
        </div>
        <div className={styles['movie-poll-container']}>
          {poll.MoviePoll.length > 3 ? (
            poll.MoviePoll.slice(3, 5).map((moviePoll) => (
              <MoviePoll
                key={`${moviePoll.movieId}-${moviePoll.pollId}`}
                moviePoll={moviePoll}
              />
            ))
          ) : (
            <div className={styles['null-movie-container']} />
          )}
        </div>
        <div className={styles['card-actions']}>
          {/* TODO: update to Link */}
          <Button
            type="button"
            onClick={() => {
              router.push(`/polls/${poll.id}`);
            }}
          >
            Edit
          </Button>
          {/* <Tabs
            tabs={[{ title: 'Edit', icon: 'edit_square' }]}
            onTabClick={() => {}}
            iconPos={'left'}
          /> */}
        </div>
      </Card>
    </div>
  );
};

const PollSlider: React.FC<{
  title: string;
  polls: Array<Poll>;
}> = ({ title, polls }) => {
  const { isNarrowViewport } = useContext(AppContext);

  const [sliceSize, setSliceSize] = useState(3);
  const [incr, setIncr] = useState(0);

  useEffect(() => {
    isNarrowViewport && setSliceSize(1);
    !isNarrowViewport && setSliceSize(3);
  }, [isNarrowViewport]);

  return (
    <article className={styles['current-polls-container']}>
      <div className={`${styles['header']}`}>
        <h2>{title}</h2>
        <div className={styles['controls']}>
          <div className={styles['prev']}>
            <Button
              icon
              type="button"
              onClick={() => {
                incr &&
                  setIncr((state) => {
                    const temp = state;
                    return temp - 1;
                  });
              }}
            >
              <span className="material-symbols-rounded">chevron_left</span>
            </Button>
          </div>
          <div className={styles['next']}>
            <Button
              icon
              type="button"
              onClick={() => {
                setIncr((state) => {
                  const temp = state;
                  const nextSlice = (temp + 1) * sliceSize;
                  if (polls.length / nextSlice > 1) return temp + 1;
                  return state;
                });
              }}
            >
              <span className="material-symbols-rounded">chevron_right</span>
            </Button>
          </div>
        </div>
      </div>
      <section className={styles['slider']}>
        {polls
          .slice(0 + sliceSize * incr, sliceSize * (incr + 1))
          .map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
      </section>
    </article>
  );
};

export default PollSlider;
