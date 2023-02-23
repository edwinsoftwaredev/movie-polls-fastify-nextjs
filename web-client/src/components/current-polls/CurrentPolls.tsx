'use client';

import { useMovie, usePolls } from 'hooks';
import { Poll } from 'src/types/poll';
import Card from '../Card';
import styles from './CurrentPolls.module.scss';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'app/AppProvider';
import Button from '../Button';

const MoviePoll: React.FC<{
  moviePoll: Poll['MoviePolls']['0'];
}> = ({ moviePoll }) => {
  const { movie, isLoading } = useMovie({ movieId: moviePoll.movieId });
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  if (isLoading || !movie) return <div className={styles['movie-container']} />;

  const {
    images: {
      posters: {
        '0': { file_path: filePath },
      },
    },
  } = movie;

  return (
    <div className={styles['movie-container']}>
      <Image
        onLoad={() => {
          setIsImgLoaded(true);
        }}
        style={{ opacity: isImgLoaded ? 1 : 0 }}
        loader={({ src, width }) => {
          if (width > 1920) return `https://image.tmdb.org/t/p/original${src}`;
          if (width > 780) return `https://image.tmdb.org/t/p/w1280${src}`;
          if (width > 300) return `https://image.tmdb.org/t/p/w780${src}`;

          return `https://image.tmdb.org/t/p/w300${src}`;
        }}
        src={`${filePath}`}
        placeholder={'empty'}
        loading={'lazy'}
        fill={true}
        sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1920px) 100vw, 100vw`}
        quality={100}
        alt={movie.title}
      />
    </div>
  );
};

const PollCardHeader: React.FC<{ poll: Poll }> = ({ poll }) => {
  return (
    <div className={styles['poll-card-header']}>
      <h3>{poll.name}</h3>
    </div>
  );
};

const CurrentPolls: React.FC = () => {
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
              onClick={() => {
                setIncr((state) => {
                  const temp = state;
                  const nextSlice = (temp + 1) * sliceSize;
                  if (inactivePolls.length / nextSlice > 1) return temp + 1;
                  return state;
                });
              }}
            >
              <span className="material-symbols-rounded">chevron_left</span>
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
                  {poll.MoviePolls.map((moviePoll) => (
                    <MoviePoll
                      key={`${moviePoll.movieId}-${moviePoll.pollId}`}
                      moviePoll={moviePoll}
                    />
                  ))}
                </div>
              </Card>
            </div>
          ))}
      </section>
    </article>
  );
};

export default CurrentPolls;
