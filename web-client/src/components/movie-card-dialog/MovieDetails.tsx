'use client';

import { useEffect, useRef } from 'react';
import { Movie } from 'types';
import styles from './MovieDetails.module.scss';
import MovieInfo from '../movie-details/MovieDetails';
import MoviePanels from '../movie-panels/MoviePanels';

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const elRef = useRef<HTMLElement>(null);
  const toRef = useRef<number>();

  useEffect(() => {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#javascript_examples
    toRef.current = window.setTimeout(() => {
      elRef.current && (elRef.current.style.opacity = '1');
    }, 50);

    return () => {
      // elRef.current && (elRef.current.style.opacity = '0');
      window.clearTimeout(toRef.current);
    };
  }, []);

  return (
    <article
      ref={elRef}
      className={`${styles['header-content']}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <section className={`${styles['movie-info-container']}`}>
        <MovieInfo movie={movie} />
      </section>
      <section className={`${styles['movie-action-panel']}`}>
        <MoviePanels movie={movie} />
      </section>
    </article>
  );
};

export default MovieDetails;
