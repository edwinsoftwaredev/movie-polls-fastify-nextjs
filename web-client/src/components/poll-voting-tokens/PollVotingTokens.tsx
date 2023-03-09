'use client';

import { Button, Input, Label } from 'components';
import { usePolls } from 'hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import trpc from 'src/trpc/client';
import { InferQueryOutput } from 'trpc/client/utils';
import styles from './PollVotingTokens.module.scss';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const VotingToken: React.FC<{
  pollName: string;
  votingToken: InferQueryOutput<'poll'>['votingTokens']['tokens']['0'];
  index: number;
  onRemove: (
    votingToken: InferQueryOutput<'poll'>['votingTokens']['tokens']['0']
  ) => void;
}> = ({ pollName, votingToken, index, onRemove }) => {
  const { data: whoaimData } = trpc.account.whoami.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { updateVotingToken } = usePolls({});

  const [tokenLabel, setTokenLabel] = useState(votingToken.label || '');
  const [inviteData, setInviteData] = useState<{
    url: string;
    title: string;
    text: string;
  }>();

  useEffect(() => {
    setTokenLabel(votingToken.label || '');
  }, [votingToken.label]);

  useEffect(() => {
    setInviteData({
      url: `${window.location.host}/polls/${votingToken.pollId}/vote?vt=${votingToken.id}`,
      title: `${pollName} movie poll`,
      text: `${
        whoaimData?.whoami?.displayName || ''
      } would like you to participate in a movie poll.`,
    });
  }, [votingToken.id, pollName, whoaimData?.whoami?.displayName]);

  return (
    <div className={styles['token-item']}>
      <b className={styles['token-index']}>
        {`${(index + 1).toString().padStart(2, '0')} - `}
      </b>
      <div className={styles['token-label-input']}>
        <Input
          defaultValue={tokenLabel}
          onChange={(val) => {
            setTokenLabel(val);
          }}
          placeholder="Invite note"
          inputType="text"
        />
      </div>
      <div className={styles['token-labels-container']}>
        <Label outlined>{votingToken.unused ? 'UNUSED' : 'USED'}</Label>
        <Label outlined>{votingToken.unshared ? 'UNSHARED' : 'SHARED'}</Label>
      </div>
      <div className={styles['actions-container']}>
        <Button
          type="button"
          onPointerDown={() => {
            inviteData?.url && navigator.clipboard.writeText(inviteData.url);
          }}
          title="Copy Invite Link"
        >
          <span className="material-symbols-rounded">content_copy</span>
        </Button>
        {typeof window !== 'undefined' &&
          inviteData &&
          navigator.canShare &&
          navigator.canShare(inviteData) && (
            <Button
              type="button"
              onClick={(e) => {
                navigator
                  .share(inviteData)
                  .then(() => {
                    updateVotingToken({
                      ...votingToken,
                      unshared: false,
                    });
                  })
                  .catch((err) => {});
              }}
              title="Share Invite"
            >
              <span className="material-symbols-rounded">share</span>
            </Button>
          )}
        <Button
          type="button"
          onClick={() => {
            updateVotingToken({
              ...votingToken,
              label: tokenLabel,
            });
          }}
          title="Update Invite"
          warn={(votingToken.label ?? '') !== tokenLabel}
        >
          <span className="material-symbols-rounded">save</span>
        </Button>
        <Button
          del
          type="button"
          onClick={() => {
            onRemove(votingToken);
          }}
          title="Remove Invite"
        >
          <span className="material-symbols-rounded">delete</span>
        </Button>
      </div>
    </div>
  );
};

const PollVotingTokens: React.FC<{
  poll: PollType;
}> = ({ poll }) => {
  const router = useRouter();

  const { data: votingTokensData } = trpc.poll.votingTokens.useQuery(
    { pollId: poll.id },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const [newVotingTokenAmount, setNewVotingTokenAmount] = useState(0);
  const [formVersion, setFormVersion] = useState(0);

  const [isPending, startTransition] = useTransition();

  const votingTokens = useMemo(
    () =>
      votingTokensData?.tokens.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [votingTokensData?.tokens]
  );

  const { addVotingTokens, removeVotingToken } = usePolls({});

  return (
    <article className={styles['voting-tokens']}>
      <div className={styles['voting-tokens-header']}>
        <h3>INVITE LINKS</h3>
        <div className={styles['new-voting-tokens-form']}>
          <Input
            key={formVersion}
            inputType="number"
            defaultValue={newVotingTokenAmount}
            maxValue={
              50 - (votingTokensData?.tokens.length || poll.votingTokenCount)
            }
            onChange={(val) => {
              setNewVotingTokenAmount(Number.parseInt(val || '0'));
            }}
            placeholder={'Number of new invites'}
          />
          <Button
            onClick={() => {
              newVotingTokenAmount &&
                newVotingTokenAmount > 0 &&
                addVotingTokens(
                  {
                    pollId: poll.id,
                    amount: newVotingTokenAmount,
                  },
                  {
                    onSuccess: () => {
                      setNewVotingTokenAmount(0);
                      setFormVersion((state) => state + 1);
                      // updates poll progress bar
                      startTransition(() => {
                        router.refresh();
                      });
                    },
                  }
                );
            }}
            type="button"
          >
            ADD INVITE LINKS
          </Button>
        </div>
      </div>
      <ul>
        {votingTokens?.map((token, index) => (
          <li key={token.id}>
            <VotingToken
              votingToken={token}
              pollName={poll.name}
              index={index}
              onRemove={(votingToken) => {
                removeVotingToken(
                  {
                    id: votingToken.id,
                    pollId: poll.id,
                  },
                  {
                    onSuccess: () => {
                      startTransition(() => {
                        router.refresh();
                      });
                    },
                  }
                );
              }}
            />
          </li>
        ))}
      </ul>
    </article>
  );
};

export default PollVotingTokens;
