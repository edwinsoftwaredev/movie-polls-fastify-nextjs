'use client';

import { useEffect, useRef, useState } from 'react';
import trpc from 'src/trpc/client';
import { Movie } from 'types';
import Card from '../Card';
import Input from '../Input';
import MovieCard from '../movie-card/MovieCard';
import styles from './Search.module.scss';

interface MovieCardContainerProps {
  movieId: Movie['id'];
}

const MovieCardContainer: React.FC<MovieCardContainerProps> = ({ movieId }) => {
  const { data: movieData } = trpc.publicMovies.movie.useQuery(
    { movieId },
    {
      enabled: !!movieId,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  if (movieData && movieData.movie)
    return (
      <div className={styles['movie-card-container']}>
        <MovieCard movie={movieData.movie} />
      </div>
    );

  return null;
};

interface MovieGridProps {
  movies: Array<{ id: Movie['id'] }>;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies }) => {
  return (
    <>
      {movies.map((movie) => (
        <MovieCardContainer key={movie.id} movieId={movie.id} />
      ))}
    </>
  );
};

const Search: React.FC = () => {
  const skeletonItems = new Array(15).fill(0);
  const searchTermTimeoutRef = useRef<number>();
  const [searchTerm, setSearchTerm] = useState('');
  const [enabled, setEnable] = useState(false);

  const { data: searchResult, isLoading: isLoadingSearch } =
    trpc.movies.search.useQuery(
      { searchTerm },
      {
        enabled: !!searchTerm && enabled,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      }
    );

  useEffect(() => {
    if (!!searchTerm) {
      setEnable(false);
      window.clearTimeout(searchTermTimeoutRef.current);
      searchTermTimeoutRef.current = window.setTimeout(() => {
        setEnable(true);
      }, 2500);
    }
  }, [searchTerm]);

  return (
    <section>
      <div className={styles['search-form']}>
        <Input
          onChange={(value) => {
            setSearchTerm(value);
          }}
          placeholder="Movie Title"
        />
      </div>
      <div className={styles['movie-grid']}>
        {isLoadingSearch ? (
          skeletonItems.map((_, index) => (
            <div key={index} className={styles['movie-card-container']}>
              <Card header={{ content: <></> }} />
            </div>
          ))
        ) : (
          <MovieGrid movies={searchResult?.movies || []} />
        )}
      </div>
    </section>
  );
};

export default Search;
