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
  const { data: movieData, isLoading } = trpc.publicMovies.movie.useQuery(
    { movieId },
    {
      enabled: !!movieId,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading)
    return (
      <div className={styles['movie-card-container']}>
        <Card header={{ content: <></> }} />
      </div>
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
  const [search, setSearch] = useState({
    term: '',
    enabled: false,
  });

  const { data: searchResult } = trpc.movies.search.useQuery(
    { searchTerm: search.term },
    {
      enabled: search.enabled,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    window.clearTimeout(searchTermTimeoutRef.current);
    search.term &&
      (searchTermTimeoutRef.current = window.setTimeout(() => {
        setSearch((state) => ({
          ...state,
          enabled: true,
        }));
      }, 4000));
  }, [search.term]);

  return (
    <section>
      <div className={styles['search-form']}>
        <Input
          onChange={(value) => {
            setSearch({
              enabled: false,
              term: value.trim().toLocaleLowerCase(),
            });
          }}
          placeholder="Movie Title"
        />
      </div>
      <div className={styles['movie-grid']}>
        {!!searchResult?.movies.length && (
          <MovieGrid movies={searchResult?.movies || []} />
        )}
        {/* {isLoadingSearch ? (
          skeletonItems.map((_, index) => (
            <div key={index} className={styles['movie-card-container']}>
              <Card header={{ content: <></> }} />
            </div>
          ))
        ) : (
          <MovieGrid movies={searchResult?.movies || []} />
        )} */}
      </div>
    </section>
  );
};

export default Search;
