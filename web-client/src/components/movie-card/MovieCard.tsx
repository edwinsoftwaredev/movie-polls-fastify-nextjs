'use client';

import Image from 'next/image';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';
import MovieCardDialog from '../movie-card-dialog/MovieCardDialog';
import Label from '../Label';

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
  const [isImgLoaded, setIsImgLoaded] = useState(false);

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
            <div className={`${styles['header-content']}`}>
              <div />
              <h3>
                <span>{title}</span>
              </h3>
              <div className={`${styles['genres-label']} header-desc`}>
                <Label wrapped outlined>
                  {genresLabel}
                </Label>
              </div>
              <div className={`${styles['popularity']} header-desc`}>
                <Label wrapped>{`${vote_average * 10}%`}</Label>
              </div>
            </div>
          ),
          backdropImage: (
            <Image
              onLoad={() => {
                setIsImgLoaded(true);
              }}
              style={{ opacity: isImgLoaded ? 1 : 0 }}
              loader={({ src, width }) => {
                if (width > 1920)
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
              sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1920px) 100vw, 100vw`}
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
