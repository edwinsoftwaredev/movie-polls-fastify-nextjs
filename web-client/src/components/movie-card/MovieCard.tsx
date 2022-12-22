'use client';

import Image from 'next/image';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';
import MovieCardDialog from './MovieCardDialog';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
  const movieCardRef = useRef<HTMLDivElement>(null);
  const [isPreview, setIsPreview] = useState(true);
  const [movieCardRect, setMovieCardRect] = useState<{
    x: number;
    y: number;
    height: number;
    width: number;
  }>();

  const resizeObserverRef = useRef<ResizeObserver>();

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
    resizeObserverRef.current = new window.ResizeObserver(() => {
      movieCardRef.current &&
        setMovieCardRect({
          x: movieCardRef.current.getBoundingClientRect().x,
          y: movieCardRef.current.getBoundingClientRect().y,
          height: movieCardRef.current.clientHeight,
          width: movieCardRef.current.clientWidth,
        });
    });
  }, []);

  useEffect(() => {
    setGenresLabel(genres.map((genres) => genres.name).join(', '));
  }, [genres]);

  useEffect(() => {
    !isPreview &&
      movieCardRef.current &&
      resizeObserverRef.current?.observe(movieCardRef.current);

    if (isPreview) resizeObserverRef.current?.disconnect();

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [isPreview]);

  return (
    <div
      ref={movieCardRef}
      onClick={() => {
        // TODO: Fix
        movieCardRef.current &&
          setMovieCardRect({
            x: movieCardRef.current.getBoundingClientRect().x,
            y: movieCardRef.current.getBoundingClientRect().y,
            height: movieCardRef.current.clientHeight,
            width: movieCardRef.current.clientWidth,
          });
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
      {!isPreview && movieCardRect ? (
        <MovieCardDialog
          movie={movie}
          posY={movieCardRect.y}
          posX={movieCardRect.x}
          initHeight={movieCardRect.height}
          initWidth={movieCardRect.width}
          onDialogClose={() => {
            setIsPreview(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default MovieCard;
