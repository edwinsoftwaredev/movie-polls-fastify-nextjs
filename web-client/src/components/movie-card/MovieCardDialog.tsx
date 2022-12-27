'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';
import {
  animateCard,
  animateDialogBackground,
  animateMovieCard,
} from './movieCardDialogAnimateConfigs';

enum TRANSITION_STATUS {
  OPEN_STARTED,
  OPEN_FINISHED,
  CLOSE_STARTED,
  CLOSE_FINISHED,
}

interface MovieCardDialogProps extends PropsWithChildren {
  movie: Movie;
  posX: number;
  posY: number;
  initHeight: number;
  initWidth: number;
  onDialogClose: () => void;
}

const MovieCardPortal: React.FC<MovieCardDialogProps> = ({
  movie,
  posX,
  posY,
  initWidth,
  initHeight,
  onDialogClose,
}) => {
  const {
    title,
    genres,
    vote_average,
    overview,
    images: {
      backdrops: {
        '0': { file_path },
      },
    },
  } = movie;

  const movieCardRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const [genresLabel, setGenresLabel] = useState(
    genres.map((genres) => genres.name).join(', ')
  );

  const [transitionStatus, setTranstionStatus] = useState(
    TRANSITION_STATUS.OPEN_STARTED
  );

  const [headerImgWidth, setHeaderImgWidth] = useState(
    document.body.clientWidth * 0.45
  );

  const handleCardAnimate = async (isReverse: boolean) => {
    if (!cardRef.current) return;
    await animateCard(
      cardRef.current,
      posX,
      posY,
      initWidth,
      initHeight,
      isReverse
    );
  };

  const handleMovieCardAnimate = async (isReverse: boolean) => {
    if (!movieCardRef.current) return;
    await animateMovieCard(
      movieCardRef.current,
      posX,
      posY,
      initWidth,
      initHeight,
      isReverse
    );
  };

  // TODO: Create hook
  useEffect(() => {
    setGenresLabel(genres.map((genres) => genres.name).join(', '));
  }, [genres]);

  useEffect(() => {
    if (transitionStatus === TRANSITION_STATUS.OPEN_STARTED) {
      animateDialogBackground(false)
        .then(() =>
          Promise.all([handleMovieCardAnimate(false), handleCardAnimate(false)])
        )
        .then(() => {
          setTranstionStatus(TRANSITION_STATUS.OPEN_FINISHED);
        });
    }
  }, [transitionStatus]);

  useEffect(() => {
    if (transitionStatus === TRANSITION_STATUS.CLOSE_STARTED) {
      Promise.all([handleMovieCardAnimate(true), handleCardAnimate(true)])
        .then(() => animateDialogBackground(true))
        .then(() => {
          setTranstionStatus(TRANSITION_STATUS.CLOSE_FINISHED);
          onDialogClose();
        });
    }
  }, [transitionStatus]);

  useEffect(() => {
    setHeaderImgWidth(document.body.clientWidth * 0.45);
    movieCardRef.current?.style.setProperty(
      '--max-header-height',
      `${document.body.clientWidth * 0.45 * (9 / 16)}px`
    );
  }, [initWidth, initHeight]);

  return createPortal(
    <div
      role={'dialog'}
      ref={movieCardRef}
      className={`${styles['movie-card']} ${styles['details-view']}`}
      onClick={() => {
        setTranstionStatus((state) => {
          if (state === TRANSITION_STATUS.OPEN_FINISHED) {
            return TRANSITION_STATUS.CLOSE_STARTED;
          }
          return state;
        });
      }}
    >
      <Card
        ref={cardRef}
        header={{
          content: (
            <article
              className={`${
                transitionStatus === TRANSITION_STATUS.OPEN_FINISHED
                  ? `open-finished header-body`
                  : 'header-body'
              }`}
            >
              <section className={`${styles['movie-details']} movie-details`}>
                <div className={'movie-title-desc'}>
                  <h3>{title}</h3>
                  <div className="release-date-rating">
                    <span className="year">(2022)</span>
                    <span className="rating">RT-00</span>
                  </div>
                </div>
                <div className={'movie-overview'}>
                  <p>{movie.overview}</p>
                </div>
                <div className={'movie-credits'}>
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
                <div className={'movie-genres-label'}>
                  <span>{genresLabel}</span>
                </div>
              </section>
              <section className={`${styles['movie-action-panel']}`}></section>
            </article>
          ),
          backdropImage: (
            <Image
              loader={({ src, width }) => {
                if (
                  width > 1500 &&
                  transitionStatus !== TRANSITION_STATUS.OPEN_STARTED
                )
                  return `https://image.tmdb.org/t/p/original${src}`;
                if (width > 780)
                  return `https://image.tmdb.org/t/p/w1280${src}`;
                if (width > 300) return `https://image.tmdb.org/t/p/w780${src}`;

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
                maxWidth: `${headerImgWidth}px`,
              }}
            />
          ),
        }}
      />
    </div>,
    document.body
  );
};

export default MovieCardPortal;
