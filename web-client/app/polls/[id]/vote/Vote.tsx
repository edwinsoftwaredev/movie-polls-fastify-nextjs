import Image from 'next/image';
import PollProgress from 'src/components/poll-progress/PollProgress';
import { InferQueryOutput } from 'trpc/client/utils';
import ExpiresOn from './ExpiresOn';
import styles from './Vote.module.scss';

const Vote: React.FC<{
  poll: InferQueryOutput<'publicPoll'>['poll']['poll'];
}> = ({ poll }) => {
  return (
    <div className={styles['vote-container']}>
      <div className={styles['poll-author-data']}>
        <div className={styles['poll-author-picture']}>
          <Image
            src={poll.author.picture ?? ''}
            alt={poll.author.picture ?? ''}
            placeholder={'empty'}
            loading={'lazy'}
            fill={true}
            quality={100}
          />
        </div>
        <p className={styles['poll-author-name-message']}>
          <span className={styles['poll-author-name']}>
            <b>{poll.author.displayName}</b> would like <b>you</b> to
            participate in this movie poll.
          </span>
        </p>
      </div>
      <div className={styles['poll-data']}>
        <h2>{`${poll.name}`}</h2>
        <div className={styles['poll-end-date']}>
          <span>Ends On: </span>
          <ExpiresOn expiresOn={poll.expiresOn || ''} />
        </div>
        <PollProgress
          value={poll.votingTokenCount - poll.remainingVotingTokenCount}
          maxValue={poll.votingTokenCount}
          type={'poll'}
        />
      </div>
    </div>
  );
};

export default Vote;
