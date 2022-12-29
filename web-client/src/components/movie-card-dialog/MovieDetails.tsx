'use client';

import { useMovieDetails } from 'hooks';
import { useEffect, useRef } from 'react';
import { Movie } from 'types';
import Label from '../Label';
import styles from './MovieDetails.module.scss';

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const { runtimeLabel, castLabel, directorLabel, genresLabel, overview } =
    useMovieDetails(movie);

  const elRef = useRef<HTMLElement>(null);
  const toRef = useRef<number>();

  useEffect(() => {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions#javascript_examples
    toRef.current = window.setTimeout(() => {
      elRef.current && (elRef.current.style.opacity = '1');
    }, 50);

    return () => {
      elRef.current && (elRef.current.style.opacity = '0');
      window.clearTimeout(toRef.current);
    };
  }, []);

  return (
    <article ref={elRef} className={`${styles['header-content']}`}>
      <section className={`${styles['movie-details']}`}>
        <div className={`${styles['movie-title-desc']}`}>
          <h3>{movie.title}</h3>
          <div className={`${styles['release-date-rating']}`}>
            <Label outlined>RT-00</Label>
            <Label>(2022)</Label>
            <Label>{runtimeLabel}</Label>
          </div>
        </div>
        <div className={`${styles['movie-overview']}`}>
          <p>{overview}</p>
        </div>
        <div className={`${styles['movie-credits']}`}>
          <div>
            <b>Director: </b>
            {directorLabel}
          </div>
          <div>
            <b>Cast: </b>
            {castLabel}
            <span>
              ,{' '}
              <em>
                <a href="/">more</a>
              </em>
            </span>
          </div>
        </div>
        <div className={`${styles['movie-genres-label']}`}>
          <Label nowrap outlined>
            {genresLabel}
          </Label>
        </div>
      </section>
      <section className={`${styles['movie-action-panel']}`}></section>
    </article>
  );
};

export default MovieDetails;
