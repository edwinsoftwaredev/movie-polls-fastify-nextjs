'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';

enum TRANSITION_STATUS {
  INITIALIZED,
  FINISHED,
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
  const appMain = document.getElementById('app-main');
  const appFooter = document.getElementById('app-footer');
  const appMainPosY = appMain?.getBoundingClientRect().y;

  const [genresLabel, setGenresLabel] = useState(
    genres.map((genres) => genres.name).join(', ')
  );

  const [transitionStatus, setTransitionStatus] = useState<TRANSITION_STATUS>(
    TRANSITION_STATUS.INITIALIZED
  );

  const hasTransitionEnded = transitionStatus === TRANSITION_STATUS.FINISHED;

  useEffect(() => {
    if (window.innerHeight < document.body.clientHeight) {
      document.body.style.overflowY = 'scroll';
    }

    appMain?.animate(
      [
        {
          position: 'static',
        },
        {
          position: 'fixed',
          top: `${appMainPosY}px`,
        },
      ],
      {
        fill: 'forwards',
        duration: 0,
        direction: 'normal',
      }
    );

    appFooter?.animate(
      [
        {
          visibility: 'visible',
        },
        {
          visibility: 'hidden',
        },
      ],
      {
        fill: 'forwards',
        duration: 0,
        direction: 'normal',
      }
    );

    const cardFrame1: Keyframe = {
      position: 'fixed',
      width: `${initWidth}px`,
      height: `${initHeight}px`,
      top: `${posY}px`,
      left: `${posX}px`,
      zIndex: '30',
    };

    const cardFrame2: Keyframe = {
      position: 'fixed',
      width: `55%`,
      height: 'auto',
      top: `6rem`,
      left: `calc(50% - (50% * 0.5))`,
      zIndex: '30',
    };

    const movieCardFrame1: Keyframe = {
      position: 'fixed',
      width: `${initWidth}px`,
      height: `${initHeight}px`,
      top: `${posY}px`,
      left: `${posX}px`,
      borderRadius: '2px',
      zIndex: '30',
    };

    const movieCardFrame2: Keyframe = {
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      maxHeight: 'fit-content',
      borderRadius: '50px',
      zIndex: '30',
    };

    const animateCard = async () => {
      await cardRef.current?.animate([cardFrame1, cardFrame1], {
        direction: 'normal',
        duration: 300,
        fill: 'forwards',
      }).finished;

      await cardRef.current?.animate(
        [
          {
            ...cardFrame1,
            height: 'auto',
          },
          cardFrame2,
        ],
        {
          delay: 100,
          direction: 'normal',
          duration: 1600,
          fill: 'forwards',
          easing: 'cubic-bezier(1, 0, 0, 1)',
        }
      ).finished;

      await cardRef.current?.animate(
        [
          cardFrame2,
          {
            ...cardFrame2,
            position: 'relative',
          },
        ],
        {
          direction: 'normal',
          duration: 0,
          fill: 'forwards',
        }
      ).finished;

      setTransitionStatus(TRANSITION_STATUS.FINISHED);
    };

    const animateMovieCard = async () => {
      await movieCardRef.current?.animate([movieCardFrame1, movieCardFrame2], {
        direction: 'normal',
        duration: 1600,
        fill: 'forwards',
        easing: 'cubic-bezier(1, 0, 0, 1)',
      }).finished;

      await movieCardRef.current?.animate(
        [
          movieCardFrame2,
          {
            ...movieCardFrame2,
            borderRadius: '0px',
          },
        ],
        {
          direction: 'normal',
          duration: 200,
          fill: 'forwards',
          easing: 'ease-out',
        }
      ).finished;

      await movieCardRef.current?.animate(
        [
          movieCardFrame2,
          {
            ...movieCardFrame2,
            borderRadius: '0px',
            position: 'absolute',
            top: `0px`,
            height: '100%',
          },
        ],
        {
          direction: 'normal',
          duration: 0,
          fill: 'forwards',
        }
      ).finished;
    };

    animateCard();
    animateMovieCard();
  }, []);

  // TODO: Create hook
  useEffect(() => {
    setGenresLabel(genres.map((genres) => genres.name).join(', '));
  }, [genres]);

  return createPortal(
    <div
      role={'dialog'}
      ref={movieCardRef}
      className={`${styles['movie-card']} ${styles['details-view']}`}
      onClick={() => {
        onDialogClose();
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
                if (width > 1500 && hasTransitionEnded)
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
              sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1500px) ${
                !hasTransitionEnded ? '1280px' : '100vw'
              }, 100vw`}
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
