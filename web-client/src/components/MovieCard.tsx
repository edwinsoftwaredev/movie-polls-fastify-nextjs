import { PropsWithChildren } from 'react';
import { Movie } from 'types';
import Card from './Card';
import styles from './MovieCard.module.scss';

interface MovieCard extends PropsWithChildren {
  movie: Movie;
}

const MovieCard: React.FC<MovieCard> = ({ movie }) => {
  const {
    title,
    images: {
      backdrops: {
        '0': { file_path },
      },
    },
  } = movie;

  return (
    <div className={`${styles['movie-card']} card`}>
      <Card>
        <div className={'overlay'}>
          <div className={'title'}>
            <p>{title}</p>
          </div>
        </div>
        <picture>
          <img
            src={`https://image.tmdb.org/t/p/original${file_path}`}
            alt={title}
          />
        </picture>
      </Card>
    </div>
  );
};

export default MovieCard;
