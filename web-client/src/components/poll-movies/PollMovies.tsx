// TODO: consider refactor into a server component
'use client';

import { useMovie, usePolls } from 'hooks';
import { useEffect, useState } from 'react';
import { InferQueryOutput } from 'trpc/client/utils';
import Button from '../Button';
import Card from '../Card';
import MovieDetails from '../movie-details/MovieDetails';
import MovieBackdrop from '../movie-images/MovieBackdrop';
import MoviePanels from '../movie-panels/MoviePanels';
import PollProgress from '../poll-progress/PollProgress';
import styles from './PollMovies.module.scss';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const Movie: React.FC<{
  id: PollType['MoviePoll']['0']['movieId'];
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
              <PollProgress progress={progress} type={'movie'} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const PollMovies: React.FC<{
  movies: PollType['MoviePoll'];
  showProgress?: boolean;
  onRemoveMovie?: (movieId: number) => void;
}> = ({ movies, showProgress, onRemoveMovie }) => {
  const [totalVotes, setTotalVotes] = useState(
    movies.reduce((prev, acc) => {
      if (!prev) return acc.voteCount ?? 0;

      return prev + (acc.voteCount ?? 0);
    }, 0)
  );

  useEffect(() => {
    setTotalVotes(
      movies.reduce((prev: number, acc) => {
        if (!prev) return acc.voteCount ?? 0;

        return prev + (acc.voteCount ?? 0);
      }, 0)
    );
  }, [movies]);

  return (
    <section className={styles['movie-list']}>
      {movies.map((movie) => (
        <Movie
          key={movie.movieId}
          id={movie.movieId}
          onRemove={onRemoveMovie}
          {...(showProgress
            ? {
                progress: totalVotes
                  ? Math.round(
                      ((movie.voteCount ?? 0) / (totalVotes ?? 1)) * 100
                    )
                  : 0,
              }
            : {})}
        />
      ))}
    </section>
  );
};

export default PollMovies;
