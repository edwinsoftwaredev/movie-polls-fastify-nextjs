'use client';

import { Movie } from 'types';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'app/AppProvider';

const MovieBackdrop: React.FC<{
  movie: Movie;
  maxWidth?: number | string;
  isPoster?: boolean;
  isBackdrop?: boolean;
  showHD?: boolean;
}> = ({ movie, maxWidth, isPoster, isBackdrop, showHD }) => {
  const { isNarrowViewport } = useContext(AppContext);

  const {
    title,
    images: {
      backdrops: {
        '0': { file_path: backdrop_file_path },
      },
      posters: {
        '0': { file_path: poster_file_path },
      },
    },
  } = movie;

  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [filePath, setFilePath] = useState<string>(
    (isNarrowViewport || isPoster) && !isBackdrop
      ? poster_file_path
      : backdrop_file_path
  );

  useEffect(() => {
    setFilePath(
      (isNarrowViewport || isPoster) && !isBackdrop
        ? poster_file_path
        : backdrop_file_path
    );
  }, [isNarrowViewport, isPoster, isBackdrop, movie]);

  return (
    <div
      style={{
        position: 'relative',
        opacity: isImgLoaded ? 1 : 0,
        aspectRatio: isBackdrop
          ? '16 / 9'
          : isNarrowViewport || isPoster
          ? '6 / 9'
          : '16 / 9',
        maxWidth:
          (typeof maxWidth === 'number' &&
            !isNarrowViewport &&
            `${maxWidth}px`) ||
          (typeof maxWidth === 'string' &&
            !isNarrowViewport &&
            `${maxWidth}%`) ||
          'auto',
        height: '100%',
        margin: isNarrowViewport || isPoster ? 'auto' : '0',
        borderRadius: isNarrowViewport || isPoster ? '0.175em' : '0',
        overflow: 'hidden',
      }}
    >
      <Image
        onLoad={() => {
          setIsImgLoaded(true);
        }}
        loader={({ src, width }) => {
          if (showHD && !isNarrowViewport) {
            if (width > 1920)
              return `https://image.tmdb.org/t/p/original${src}`;
            if (width > 780) return `https://image.tmdb.org/t/p/w1280${src}`;
            if (width > 300) return `https://image.tmdb.org/t/p/w780${src}`;

            return `https://image.tmdb.org/t/p/w300${src}`;
          } else {
            if (width > 1920) return `https://image.tmdb.org/t/p/w1280${src}`;
            if (width > 300) return `https://image.tmdb.org/t/p/w780${src}`;

            return `https://image.tmdb.org/t/p/w300${src}`;
          }
        }}
        src={`${filePath}`}
        placeholder={'empty'}
        loading={'lazy'}
        fill={true}
        sizes={`(min-width: 300px) 780px, (min-width: 780px) ${
          showHD && !isNarrowViewport ? '1280px' : '780px'
        } , (min-width: 1280px) ${
          showHD && !isNarrowViewport ? '1280px' : '780px'
        }, (min-width: 1920px) ${
          showHD && !isNarrowViewport ? '100vw' : '780px'
        }, 100vw`}
        quality={100}
        alt={title}
      />
    </div>
  );
};

export default MovieBackdrop;
