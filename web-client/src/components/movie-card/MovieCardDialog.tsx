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
            <div className="header-body">
              <div />
              <h3>
                <span>{title}</span>
              </h3>
              <div className="genres-label header-desc">
                <span>{genresLabel}</span>
              </div>
              <div className="popularity header-desc">
                <span>{`${vote_average * 10}%`}</span>
              </div>
            </div>
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
            />
          ),
        }}
      />
    </div>,
    document.body
  );
};

export default MovieCardPortal;
