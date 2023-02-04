'use client';

import Image from 'next/image';
import {
  PropsWithChildren,
  useContext,
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
import { AppContext } from 'app/AppProvider';
import Dialog from '../Dialog';

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
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const resizeObserverRef = useRef<ResizeObserver>();

  const {
    title,
    vote_average,
    genresLabel,
    images: {
      backdrops: {
        '0': { file_path: backdrop_file_path },
      },
      posters: {
        '0': { file_path: poster_file_path },
      },
    },
  } = useMovieDetails(movie, false, false);

  const { isNarrowViewport } = useContext(AppContext);

  const [filePath, setFilePath] = useState<string>(
    isNarrowViewport ? poster_file_path : backdrop_file_path
  );

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

  useEffect(() => {
    setFilePath(isNarrowViewport ? poster_file_path : backdrop_file_path);
  }, [isNarrowViewport]);

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
                <Label nowrap>{`${vote_average * 10}%`}</Label>
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
              src={`${filePath}`}
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
