'use client';

import { useMovieDetails } from 'hooks';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Label from '../Label';
import Panel from '../Panel';
import styles from './MovieDetails.module.scss';
import Image from 'next/image';

const tabs: ComponentProps<typeof Panel>['tabs'] = [
  {title: 'Poster', icon: 'image'},
  {title: 'Poll', icon: 'pollStats'}, // ?
  {title: 'Streaming', icon: 'streamingOn'},
  {title: 'Buy', icon: 'availableOn'},
];

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const {
    runtimeLabel,
    castLabel,
    directorLabel,
    genresLabel,
    overview,
    additionalDetails,
    images,
    title
  } = useMovieDetails(movie, true);

  const { 
    posters: {
      '0': {
        file_path
      }
    }
  } = images;

  const { ratingLabel, releaseYearLabel } = additionalDetails || {};

  const elRef = useRef<HTMLElement>(null);
  const toRef = useRef<number>();

  const [currentTab, setCurrentTab] = useState('poster');

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
    <article ref={elRef} className={`${styles['header-content']}`}>
      <section className={`${styles['movie-details']}`}>
        <div className={`${styles['movie-title-desc']}`}>
          <h3>{movie.title}</h3>
          <div className={`${styles['release-date-rating']}`}>
            {ratingLabel ? <Label outlined>{ratingLabel}</Label> : null}
            {releaseYearLabel ? <Label>{`(${releaseYearLabel})`}</Label> : null}
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
      <section className={`${styles['movie-action-panel']}`}>
        <Panel 
          tabs={tabs} 
          onTabClick={(tabTitle) => {
            setCurrentTab(tabTitle)
          }}
        >
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            height: '100%',
            width: '100%',
            borderRadius: '2px'
          }}>
            <Image 
              loader={({ src, width }) => {
                if (
                  width > 1500
                )
                  return `https://image.tmdb.org/t/p/w780${src}`;
                if (width > 780)
                  return `https://image.tmdb.org/t/p/w780${src}`;
                if (width > 300) return `https://image.tmdb.org/t/p/w500${src}`;

                return `https://image.tmdb.org/t/p/w300${src}`;
              }}
              src={`${file_path}`}
              placeholder={'empty'}
              loading={'lazy'}
              fill={true}
              sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1500px) 100vw, 100vw`}
              quality={100}
              alt={title}
              style={{
                objectFit: 'cover',
                borderRadius: '2px'
              }}
            />
          </div>
        </Panel>
      </section>
    </article>
  );
};

export default MovieDetails;
