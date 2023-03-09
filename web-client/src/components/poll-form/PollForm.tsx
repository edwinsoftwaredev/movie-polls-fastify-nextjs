'use client';

import { useDate, usePolls } from 'hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import trpc from 'src/trpc/client';
import { InferQueryOutput } from 'trpc/client/utils';
import Button from '../Button';
import Input from '../Input';
import PollProgress from '../poll-progress/PollProgress';
import PollVotingTokens from '../poll-voting-tokens/PollVotingTokens';
import styles from './PollForm.module.scss';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const ActivePoll: React.FC<{
  poll: PollType;
  onUpdate: (
    ...args: Parameters<ReturnType<typeof usePolls>['updatePoll']>
  ) => void;
}> = ({ poll, onUpdate }) => {
  const [endsOn, setEndsOn] = useState('');
  const { getServerDateFromClientDate } = useDate();

  useEffect(() => {
    setEndsOn(
      poll.expiresOn
        ? new Date(poll.expiresOn).toLocaleString(undefined, {
            dateStyle: 'long',
            timeStyle: 'short',
          })
        : ''
    );
  }, [poll.expiresOn]);

  return (
    <div className={styles['active-poll']}>
      <div className={styles['form-container']}>
        <h2>{`${poll.name}`}</h2>
        <div className={styles['poll-end-date']}>
          {!!endsOn && (
            <>
              <span>Ends On: </span>
              <span>{endsOn}</span>
            </>
          )}
        </div>
        <PollProgress
          value={poll.votingTokenCount - poll.remainingVotingTokenCount}
          maxValue={poll.votingTokenCount}
          type={'poll'}
        />
        <Button
          outlined
          onClick={() => {
            const { MoviePoll, ...rest } = poll;
            onUpdate({
              ...rest,
              expiresOn: new Date(
                getServerDateFromClientDate(
                  new Date(poll.expiresOn!).toISOString()
                )
              ),
              isActive: false,
            });
          }}
          type="button"
        >
          CLOSE POLL
        </Button>
      </div>
    </div>
  );
};

const InactivePoll: React.FC<{
  poll: PollType;
  onUpdate: (
    ...args: Parameters<ReturnType<typeof usePolls>['updatePoll']>
  ) => void;
}> = ({ poll, onUpdate }) => {
  let now = new Date();
  let endDateTemp = new Date();

  const { getServerDateFromClientDate } = useDate();
  const [pollName, setPollName] = useState(poll.name);
  const [endDate, setEndDate] = useState(
    poll.expiresOn ||
      new Date(endDateTemp.setHours(endDateTemp.getHours() + 12)).toISOString()
  );
  const [maxDate, setMaxDate] = useState<Date>(
    new Date(now.setDate(now.getDate() + 28))
  );

  useEffect(() => {
    now = new Date();
    endDateTemp = new Date();

    setMaxDate(new Date(now.setDate(now.getDate() + 28)));
    setEndDate(
      poll.expiresOn ||
        new Date(
          endDateTemp.setHours(endDateTemp.getHours() + 12)
        ).toISOString()
    );
  }, []);

  return (
    <div className={styles['inactive-poll']}>
      <div className={styles['form-container']}>
        <Input
          defaultValue={poll.name}
          placeholder="Poll Name"
          onChange={(val) => {
            setPollName(val);
          }}
          inputType="text"
        />
        <Input
          defaultValue={endDate}
          maxValue={maxDate}
          placeholder="End Date"
          onChange={(val) => {
            setEndDate(getServerDateFromClientDate(val));
          }}
          inputType="date"
        />
        <Button
          onClick={() => {
            if (new Date(endDate) <= new Date()) return;

            // NOTE: If the property MoviePoll is not removed
            // there will be no type error or warning.
            const { MoviePoll, ...rest } = poll;

            onUpdate({
              ...rest,
              // NOTE: the time part of a Date is local
              expiresOn: new Date(endDate),
              name: pollName,
              isActive: true,
            });
          }}
          disabled={new Date(endDate) <= new Date()}
          outlined
          type="button"
        >
          START POLL
        </Button>
      </div>
    </div>
  );
};

const PollForm: React.FC<{
  poll: InferQueryOutput<'poll'>['getPoll']['poll'];
}> = ({ poll }) => {
  const router = useRouter();
  const {
    poll: { votingTokens },
  } = trpc.useContext();
  const { updatePoll, isSuccessUpdatePoll, isSuccessRemoveMovie } = usePolls(
    {}
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    isSuccessUpdatePoll &&
      startTransition(() => {
        router.refresh();
      });
  }, [isSuccessUpdatePoll]);

  useEffect(() => {
    isSuccessRemoveMovie &&
      startTransition(() => {
        router.refresh();
      });
  }, [isSuccessRemoveMovie]);

  return (
    <>
      {poll.isActive ? (
        <ActivePoll
          poll={poll}
          onUpdate={(p) => {
            updatePoll(p, {
              onSuccess: (input) => {
                // Tokens will be flagged as unused
                poll.isActive &&
                  !input.poll.isActive &&
                  votingTokens.refetch({ pollId: poll.id });
              },
            });
          }}
        />
      ) : (
        <InactivePoll
          poll={poll}
          onUpdate={(p) => {
            updatePoll(p);
          }}
        />
      )}
    </>
  );
};

export default PollForm;
