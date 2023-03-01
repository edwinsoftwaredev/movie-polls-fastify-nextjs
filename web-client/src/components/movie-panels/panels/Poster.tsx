import styles from './Poster.module.scss';
import MovieBackdrop from 'src/components/movie-images/MovieBackdrop';
import { Movie } from 'types';

interface PosterProps {
  movie: Movie;
}

const Poster: React.FC<PosterProps> = ({ movie }) => {
  return (
    <div className={styles['poster-container']}>
      <div className={styles['poster']}>
        <MovieBackdrop movie={movie} isPoster={true} />
      </div>
    </div>
  );
};

export default Poster;
