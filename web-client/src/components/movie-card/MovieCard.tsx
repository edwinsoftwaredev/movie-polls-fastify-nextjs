'use client';

import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Movie } from 'types';
import Card from '../Card';
import styles from './MovieCard.module.scss';
import MovieCardDialog from '../movie-card-dialog/MovieCardDialog';
import Label from '../Label';
import { useMovieDetails } from 'hooks';
import Dialog from '../Dialog';
import MovieBackdrop from '../movie-images/MovieBackdrop';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
  const movieCardRef = useRef<HTMLDivElement>(null);
  const [movieCardDialogProps, setMovieCardDialogProps] = useState({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    isPreview: true,
  });

  const resizeObserverRef = useRef<ResizeObserver>();

  const {
    title,
    vote_average,
    genresLabel,
  } = useMovieDetails(movie, false, false);

  useEffect(() => {
    resizeObserverRef.current = new window.ResizeObserver(() => {
      movieCardRef.current &&
        setMovieCardDialogProps((state) => ({
          ...state,
          x: movieCardRef.current!.getBoundingClientRect().x,
          y: movieCardRef.current!.getBoundingClientRect().y,
          height: movieCardRef.current!.getBoundingClientRect().height,
          width: movieCardRef.current!.getBoundingClientRect().width,
        }));
    });
  }, []);

  useEffect(() => {
    !movieCardDialogProps.isPreview &&
      movieCardRef.current &&
      resizeObserverRef.current?.observe(movieCardRef.current);

    if (movieCardDialogProps.isPreview) resizeObserverRef.current?.disconnect();

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [movieCardDialogProps.isPreview]);

  return (
    <div
      ref={movieCardRef}
      onClick={() => {
        movieCardRef.current &&
          setMovieCardDialogProps({
            x: movieCardRef.current.getBoundingClientRect().x,
            y: movieCardRef.current.getBoundingClientRect().y,
            height: movieCardRef.current.getBoundingClientRect().height,
            width: movieCardRef.current.getBoundingClientRect().width,
            isPreview: false,
          });
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
                <Label nowrap outlined>
                  {genresLabel}
                </Label>
              </div>
              <div className={`${styles['popularity']} header-desc`}>
                <Label nowrap>{`${vote_average}%`}</Label>
              </div>
            </div>
          ),
          backdropImage: (
            <MovieBackdrop movie={movie} />
          ),
        }}
      />
      <Dialog isOpen={!movieCardDialogProps.isPreview}>
        <MovieCardDialog
          movie={movie}
          posY={movieCardDialogProps.y}
          posX={movieCardDialogProps.x}
          initHeight={movieCardDialogProps.height}
          initWidth={movieCardDialogProps.width}
          onDialogClose={() => {
            setMovieCardDialogProps((state) => ({
              ...state,
              isPreview: true,
            }));
          }}
        />
      </Dialog>
    </div>
  );
};

export default MovieCard;
