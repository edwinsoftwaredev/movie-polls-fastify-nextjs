import Image from 'next/image';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Card from './Card';
import styles from './MovieCard.module.scss';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
  const movieCardRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [isPreview, setIsPreview] = useState(true);
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

  const [genresLabel, setGenresLabel] = useState(
    genres.map((genres) => genres.name).join(', ')
  );

  useEffect(() => {
    setGenresLabel(genres.map((genres) => genres.name).join(', '));
  }, [genres]);

  return (
    <div
      ref={movieCardRef}
      onClick={() => {
        if (!isPreview) return;

        setIsPreview(false);

        if (movieCardRef.current && cardRef.current) {
          const cw = movieCardRef.current.clientWidth;
          const ch = movieCardRef.current.clientHeight;
          const posX = movieCardRef.current.getBoundingClientRect().x;
          const posY = movieCardRef.current.getBoundingClientRect().y;

          const cardFrame1: Keyframe = {
            position: 'fixed',
            width: `${cw}px`,
            height: `${ch}px`,
            top: `${posY}px`,
            left: `${posX}px`,
            zIndex: '30',
          };

          const cardFrame2: Keyframe = {
            position: 'fixed',
            width: `55%`,
            height: 'auto',
            top: `6rem`,
            left: `calc(50% - 50% * 0.5)`,
            zIndex: '30',
          };

          const movieCardFrame1: Keyframe = {
            position: 'fixed',
            width: `${cw}px`,
            height: `${ch}px`,
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
            width: '100vw',
            height: '100vh',
            borderRadius: '50px',
            zIndex: '30',
          };

          cardRef.current
            .animate([cardFrame1, cardFrame1], {
              direction: 'normal',
              duration: 300,
              fill: 'forwards',
            })
            .finished.then(() => {
              return cardRef.current?.animate(
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
              );
            });

          movieCardRef.current
            .animate([movieCardFrame1, movieCardFrame2], {
              direction: 'normal',
              duration: 1600,
              fill: 'forwards',
              easing: 'cubic-bezier(1, 0, 0, 1)',
            })
            .finished.then(() => {
              return movieCardRef.current?.animate(
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
              );
            });
        }
      }}
      className={`${styles['movie-card']} ${
        isPreview ? '' : styles['details-view']
      }`}
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
                if (width > 2240 && !isPreview)
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
              sizes="300px, 780px, 1280px"
              quality={100}
              alt={title}
            />
          ),
        }}
      />
    </div>
  );
};

export default MovieCard;
