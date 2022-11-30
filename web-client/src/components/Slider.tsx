'use client';

import { Movies } from 'types';
import Slide from './Slide';
import styles from './Slider.module.scss';

interface SliderProps {
  movies: Movies;
}

const Slider: React.FC<SliderProps> = ({ movies }) => {
  return (
    <div className={styles['slider']}>
      <Slide movies={movies}/> 
    </div>
  );
};

export default Slider;
