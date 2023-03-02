'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PollSlider from 'src/components/poll-slider/PollSlider';
import { Poll } from 'types';

const CurrentPolls: React.FC<{ activePolls: Array<Poll> }> = ({
  activePolls,
}) => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  if (!activePolls.length) return null;

  return <PollSlider title={'Current Polls'} polls={activePolls} />;
};

export default CurrentPolls;
