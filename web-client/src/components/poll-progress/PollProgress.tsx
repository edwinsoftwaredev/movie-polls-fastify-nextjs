import { Poll } from 'types';
import ProgressBar from '../ProgressBar';

const PollProgress: React.FC<{ poll: Poll }> = ({ poll }) => {
  return (
    <ProgressBar
      value={
        poll.votingTokenCount
          ? Math.round(
              ((poll.votingTokenCount - poll.remainingVotingTokenCount) /
                poll.votingTokenCount) *
                100
            )
          : 0
      }
      label={`${poll.votingTokenCount - poll.remainingVotingTokenCount}/${
        poll.votingTokenCount
      }`}
    />
  );
};

export default PollProgress;
