import { useMovieDetails } from 'hooks';
import { Movie } from 'types';
import Label from '../Label';
import styles from './MovieDetails.module.scss';

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const {
    runtimeLabel,
    castLabel,
    directorLabel,
    genresLabel,
    overview,
    additionalDetails,
  } = useMovieDetails(movie, true);

  const { ratingLabel, releaseYearLabel } = additionalDetails || {};

  return (
    <div className={`${styles['movie-details']}`}>
      <div className={`${styles['movie-title-desc']}`}>
        <h3>{movie.title}</h3>
        <div className={`${styles['release-date-rating']}`}>
          {ratingLabel ? <Label outlined>{ratingLabel}</Label> : null}
          {releaseYearLabel ? <Label>{`(${releaseYearLabel})`}</Label> : null}
          <Label>{runtimeLabel}</Label>
        </div>
      </div>
      <div className={`${styles['movie-overview']}`}>
        <p>{overview}</p>
      </div>
      <div className={`${styles['movie-credits']}`}>
        <div>
          <span>
            <b>Director: </b>
          </span>
          <span>{directorLabel}</span>
        </div>
        <div>
          <span>
            <b>Cast: </b>
          </span>
          <span>{castLabel}</span>
          <span>
            ,{' '}
            <em>
              <a
                href={`${process.env.NEXT_PUBLIC_TMDB_URL}/movie/${movie.id}/cast`}
                title={'Visit TMDB'}
                referrerPolicy="no-referrer"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                more
              </a>
            </em>
          </span>
        </div>
      </div>
      <div className={`${styles['movie-genres-label']}`}>
        <Label nowrap outlined>
          {genresLabel}
        </Label>
      </div>
    </div>
  );
};

export default MovieDetails;
