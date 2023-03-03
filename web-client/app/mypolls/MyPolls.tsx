'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PollSlider from 'src/components/poll-slider/PollSlider';
import { InferQueryOutput } from 'trpc/client/utils';
import { Poll } from 'types';

const MyPolls: React.FC<{
  activePolls: InferQueryOutput<'poll'>['activePolls']['polls'];
  inactivePolls: InferQueryOutput<'poll'>['inactivePolls']['polls'];
}> = ({ activePolls, inactivePolls }) => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  return (
    <>
      <section className={'slider-container'}>
        <PollSlider title={'Active Polls'} polls={activePolls as Array<Poll>} />
      </section>

      <section className={'slider-container'}>
        <PollSlider
          title={'Inactive Polls'}
          polls={inactivePolls as Array<Poll>}
        />
      </section>
    </>
  );
};

export default MyPolls;
