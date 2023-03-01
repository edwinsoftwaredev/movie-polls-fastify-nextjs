'use client';

import { useMovie, usePolls } from 'hooks';
import { Poll } from 'src/types/poll';
import Card from '../Card';
import styles from './CurrentPolls.module.scss';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'app/AppProvider';
import Button from '../Button';
import ProgressBar from '../ProgressBar';
import { useRouter } from 'next/navigation';
import MovieBackdrop from '../movie-images/MovieBackdrop';

const MoviePoll: React.FC<{
  moviePoll: Poll['MoviePolls']['0'];
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
  return (
    <div className={styles['poll-card-header']}>
      <div className={styles['title-expire-date']}>
        <h3>{poll.name}</h3>
        <div className={styles['expire-on-date']}>
          {new Date().toLocaleString(undefined, {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </div>
      </div>
      <div className={styles['poll-progress']}>
        <ProgressBar value={Math.random() * 100} />
      </div>
    </div>
  );
};

const CurrentPolls: React.FC = () => {
  const router = useRouter();
  const { isNarrowViewport } = useContext(AppContext);
  const { inactivePolls, isSuccessInactivePolls } = usePolls({
    fetchInactivePolls: true,
  });

  const [sliceSize, setSliceSize] = useState(3);
  const [incr, setIncr] = useState(0);

  useEffect(() => {
    isNarrowViewport && setSliceSize(1);
    !isNarrowViewport && setSliceSize(3);
  }, [isNarrowViewport]);

  if (!isSuccessInactivePolls) return null;

  return (
    <article className={styles['current-polls-container']}>
      <div className={`${styles['header']}`}>
        <h2>Current Polls</h2>
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
                  if (inactivePolls.length / nextSlice > 1) return temp + 1;
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
        {inactivePolls
          .slice(0 + sliceSize * incr, sliceSize * (incr + 1))
          .map((poll) => (
            <div key={poll.id} className={styles['poll-card']}>
              <Card
                contrast={'dark'}
                header={{ content: <PollCardHeader poll={poll} /> }}
              >
                <div className={styles['movie-poll-container']}>
                  {poll.MoviePolls.slice(0, 3).map((moviePoll) => (
                    <MoviePoll
                      key={`${moviePoll.movieId}-${moviePoll.pollId}`}
                      moviePoll={moviePoll}
                    />
                  ))}
                </div>
                <div className={styles['movie-poll-container']}>
                  {poll.MoviePolls.length > 3 ? (
                    poll.MoviePolls.slice(3, 5).map((moviePoll) => (
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
          ))}
      </section>
    </article>
  );
};

export default CurrentPolls;
