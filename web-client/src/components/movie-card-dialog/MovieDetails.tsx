'use client';

import { useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Label from '../Label';
import styles from './MovieDetails.module.scss';

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const elRef = useRef<HTMLElement>(null);
  const toRef = useRef<number>();

  const [genresLabel, setGenresLabel] = useState(
    movie.genres.map((genres) => genres.name).join(', ')
  );

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

  // TODO: Create hook
  useEffect(() => {
    setGenresLabel(movie.genres.map((genres) => genres.name).join(', '));
  }, [movie.genres]);

  return (
    <article ref={elRef} className={`${styles['header-content']}`}>
      <section className={`${styles['movie-details']}`}>
        <div className={`${styles['movie-title-desc']}`}>
          <h3>{movie.title}</h3>
          <div className={`${styles['release-date-rating']}`}>
            <Label>(2022)</Label>
            <Label outlined>RT-00</Label>
          </div>
        </div>
        <div className={`${styles['movie-overview']}`}>
          <p>{movie.overview}</p>
        </div>
        <div className={`${styles['movie-credits']}`}>
          <div>
            <b>Director: </b>
            {'The Director'}
          </div>
          <div>
            <b>Cast: </b>
            {'The Cast'}
          </div>
          <div>
            <b>Duration: </b>
            {'2h 49m'}
          </div>
        </div>
        <div className={`${styles['movie-genres-label']}`}>
          <Label wrapped outlined>
            {genresLabel}
          </Label>
        </div>
      </section>
      <section className={`${styles['movie-action-panel']}`}></section>
    </article>
  );
};

export default MovieDetails;
