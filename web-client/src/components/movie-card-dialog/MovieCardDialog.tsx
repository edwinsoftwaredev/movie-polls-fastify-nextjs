'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCardDialog.module.scss';
import {
  animateCard,
  animateMovieCard,
} from './movie-card-dialog-animate-configs';
import MovieDetails from './MovieDetails';
import MovieBackdrop from '../movie-images/MovieBackdrop';

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
  const movieCardRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const [transitionStatus, setTranstionStatus] = useState(
    TRANSITION_STATUS.OPEN_STARTED
  );

  const [headerImgWidth, setHeaderImgWidth] = useState(
    document.body.getBoundingClientRect().width * 0.45
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

  useEffect(() => {
    if (transitionStatus === TRANSITION_STATUS.OPEN_STARTED) {
      Promise.all([
        handleMovieCardAnimate(false),
        handleCardAnimate(false),
      ]).then(() => {
        setTranstionStatus(TRANSITION_STATUS.OPEN_FINISHED);
      });
    }
  }, [transitionStatus]);

  useEffect(() => {
    if (transitionStatus === TRANSITION_STATUS.CLOSE_STARTED) {
      Promise.all([handleMovieCardAnimate(true), handleCardAnimate(true)]).then(
        () => {
          setTranstionStatus(TRANSITION_STATUS.CLOSE_FINISHED);
          onDialogClose();
        }
      );
    }
  }, [transitionStatus]);

  useEffect(() => {
    setHeaderImgWidth(document.body.getBoundingClientRect().width * 0.45);
    movieCardRef.current?.style.setProperty(
      '--max-header-height',
      `${document.body.getBoundingClientRect().width * 0.45 * (9 / 16)}px`
    );
  }, [initWidth, initHeight]);

  return (
    <div
      role={'dialog'}
      ref={movieCardRef}
      className={`${styles['movie-card-dialog']}`}
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
          backdropImage: (
            <MovieBackdrop
              movie={movie}
              maxWidth={headerImgWidth}
              isBackdrop
              showHD
            />
          ),
        }}
      >
        {transitionStatus === TRANSITION_STATUS.OPEN_FINISHED ? (
          <MovieDetails movie={movie} />
        ) : null}
      </Card>
    </div>
  );
};

export default MovieCardPortal;
