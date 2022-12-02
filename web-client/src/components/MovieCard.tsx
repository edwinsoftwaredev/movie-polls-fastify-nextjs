import { PropsWithChildren, useEffect, useState } from 'react';
import { Movie } from 'types';
import Card from './Card';
import styles from './MovieCard.module.scss';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
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
    <div className={`${styles['movie-card']}`}>
      <Card>
        <header className="title">
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
          <picture>
            <img
              src={`https://image.tmdb.org/t/p/original${file_path}`}
              alt={title}
            />
          </picture>
        </header>
      </Card>
    </div>
  );
};

export default MovieCard;
