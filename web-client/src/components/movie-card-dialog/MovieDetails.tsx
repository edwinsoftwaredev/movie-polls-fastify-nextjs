'use client';

import { useMovieDetails } from 'hooks';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Label from '../Label';
import Panel from '../Panel';
import Poster from './movie-card-details-panels/Poster';
import styles from './MovieDetails.module.scss';
import AvailableOn from './movie-card-details-panels/AvailableOn';
import Polls from './movie-card-details-panels/Polls';

const tabs: ComponentProps<typeof Panel>['tabs'] = [
  { title: 'Title', icon: 'image' },
  { title: 'Polls', icon: 'leaderboard' }, // ?
  { title: 'Available On', icon: 'subscriptions' },
];

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const [currentTab, setCurrentTab] = useState('Title');
  const {
    runtimeLabel,
    castLabel,
    directorLabel,
    genresLabel,
    overview,
    additionalDetails,
    images,
    title,
    providers,
  } = useMovieDetails(movie, true, currentTab === 'Available On');

  const {
    posters: {
      '0': { file_path },
    },
  } = images;

  const { ratingLabel, releaseYearLabel } = additionalDetails || {};

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
            <span>
              <b>Director: </b>
            </span>
            <span>{directorLabel}</span>
          </div>
          <div>
            <span>
              <b>Cast: </b>
            </span>
            <span>{castLabel}</span>
            <span>
              ,{' '}
              <em>
                <a
                  href={`${process.env.NEXT_PUBLIC_TMDB_URL}/movie/${movie.id}/cast`}
                  title={'Visit TMDB'}
                  referrerPolicy="no-referrer"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  more
                </a>
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
            setCurrentTab(tabTitle);
          }}
          defaultActiveTab={'Title'}
        >
          {currentTab === 'Title' ? (
            <Poster title={title} file_path={file_path} />
          ) : null}
          {currentTab === 'Available On' ? (
            <AvailableOn providers={providers} movieTitle={title} />
          ) : null}
          {currentTab === 'Polls' ? <Polls /> : null}
        </Panel>
      </section>
    </article>
  );
};

export default MovieDetails;
