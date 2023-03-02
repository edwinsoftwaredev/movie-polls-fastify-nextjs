'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PollSlider from 'src/components/poll-slider/PollSlider';
import { Poll } from 'types';

const MyPolls: React.FC<
  {activePolls: Array<Poll>;
  inactivePolls: Array<Poll>}
> = ({activePolls, inactivePolls}) => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  return (
    <>
      <section className={'slider-container'}>
        <PollSlider title={'Active Polls'} polls={activePolls} />
      </section>

      <section className={'slider-container'}>
        <PollSlider title={'Inactive Polls'} polls={inactivePolls} />
      </section>    
    </>
  );
}

export default MyPolls;