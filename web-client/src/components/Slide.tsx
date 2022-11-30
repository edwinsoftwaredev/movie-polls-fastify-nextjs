import { PropsWithChildren } from "react";
import { Movies } from "types";
import MovieCard from "./MovieCard";
import style from "./Slide.module.scss";

interface SlideProps extends PropsWithChildren {
  movies: Movies,
}

const Slide: React.FC<SlideProps> = ({
  movies,
}) => {
  return (
    <div className={style['slide']}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default Slide;
