'use client';

import { useRouter } from 'next/navigation';
import Select from '../Select';
import styles from './DSelect.module.scss';

interface DSelectProps {
  d: number;
}

const DSelect: React.FC<DSelectProps> = ({ d }) => {
  const router = useRouter();

  return (
    <div className={`${styles['d-select']} ${styles['title']}`}>
      <Select
        options={[
          {
            title: `2020's`,
            value: 2020,
          },
          {
            title: `2010's`,
            value: 2010,
          },
          {
            title: `2000's`,
            value: 2000,
          },
          {
            title: `1990's`,
            value: 1990,
          },
          {
            title: `1980's`,
            value: 1980,
          },
          {
            title: `1970's`,
            value: 1970,
          },
        ]}
        defaultValue={d}
        onOptionClick={(option) => {
          router.push(`/topmovies?d=${option}`, {
            forceOptimisticNavigation: true,
          });
        }}
      />
      <h2>Popular Movies</h2>
    </div>
  );
};

export default DSelect;
