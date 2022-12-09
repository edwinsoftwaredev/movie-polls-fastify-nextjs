import Image from 'next/image';
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
          <Image 
            loader={({src, width}) => {
              if (width > 1280) 
                return `https://image.tmdb.org/t/p/original${src}`;
              if (width > 780) 
                return `https://image.tmdb.org/t/p/w1280${src}`;
              if (width > 300)
                return `https://image.tmdb.org/t/p/w780${src}`;

              return `https://image.tmdb.org/t/p/w300${src}`;
            }}
            src={`${file_path}`}
            placeholder={'empty'}
            loading={'lazy'}
            fill={true}
            sizes="(max-width: 780px) 100vw, (max-width: 1080px) 90vw, (max-width: 1280px) 70vw, (max-width: 1920px) 25vw, (max-width: 2300px) 20vw, 10vw"
            quality={100}
            alt={title}
          />
        </header>
      </Card>
    </div>
  );
};

export default MovieCard;
