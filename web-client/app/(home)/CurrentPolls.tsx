'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PollSlider from 'src/components/poll-slider/PollSlider';
import { InferQueryOutput } from 'trpc/client/utils';
import { Poll } from 'types';

const CurrentPolls: React.FC<{
  activePolls: InferQueryOutput<'poll'>['activePolls']['polls'];
}> = ({ activePolls }) => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  if (!activePolls.length) return null;

  return (
    <PollSlider title={'Current Polls'} polls={activePolls as Array<Poll>} />
  );
};

export default CurrentPolls;
