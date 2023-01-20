import styles from './Poster.module.scss';
import Image from 'next/image';

interface PosterProps {
  title: string;
  file_path: string;
}

const Poster: React.FC<PosterProps> = ({ file_path, title }) => {
  return (
    <div className={styles['poster-container']}>
      <div className={styles['poster']}>
        <Image
          loader={({ src, width }) => {
            if (width > 1500) return `https://image.tmdb.org/t/p/w780${src}`;
            if (width > 780) return `https://image.tmdb.org/t/p/w780${src}`;
            if (width > 300) return `https://image.tmdb.org/t/p/w500${src}`;

            return `https://image.tmdb.org/t/p/w300${src}`;
          }}
          src={`${file_path}`}
          placeholder={'empty'}
          loading={'lazy'}
          fill={true}
          sizes={`(min-width: 300px) 780px, (min-width: 780px) 1280px, (min-width: 1280px) 1280px, (min-width: 1500px) 100vw, 100vw`}
          quality={100}
          alt={title}
        />
      </div>
    </div>
  );
};

export default Poster;
