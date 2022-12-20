import Image from 'next/image';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';
import MovieCardPortal from './MovieCardDialog';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
  const movieCardRef = useRef<HTMLDivElement>(null);
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
        setIsPreview(false);
      }}
      className={`${styles['movie-card']}`}
    >
      <Card
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
                if (width > 1800)
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
              sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1800px) 100vw, 100vw`}
              quality={100}
              alt={title}
            />
          ),
        }}
      />
      {!isPreview && movieCardRef.current ? (
        <MovieCardPortal
          movie={movie}
          posY={movieCardRef.current.getBoundingClientRect().y}
          posX={movieCardRef.current.getBoundingClientRect().x}
          initHeight={movieCardRef.current.clientHeight}
          initWidth={movieCardRef.current.clientWidth}
          onDialogClose={() => {
            setIsPreview(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default MovieCard;
