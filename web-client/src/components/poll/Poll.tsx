'use client';

import { useDate, useMovie, usePolls } from 'hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import trpc from 'src/trpc/client';
import { InferQueryOutput } from 'trpc/client/utils';
import Button from '../Button';
import Card from '../Card';
import Input from '../Input';
import Label from '../Label';
import MovieDetails from '../movie-details/MovieDetails';
import MovieBackdrop from '../movie-images/MovieBackdrop';
import MoviePanels from '../movie-panels/MoviePanels';
import PollProgress from '../poll-progress/PollProgress';
import ProgressBar from '../ProgressBar';
import styles from './Poll.module.scss';

type PollType = InferQueryOutput<'poll'>['getPoll']['poll'];

const VotingToken: React.FC<{
  pollId: PollType['id'];
  pollName: string;
  votingToken: InferQueryOutput<'poll'>['votingTokens']['tokens']['0'];
  index: number;
}> = ({ pollName, votingToken, pollId, index }) => {
  const canShare = window.navigator.canShare;
  const share = window.navigator.share;

  const router = useRouter();

  const { data: whoaimData } = trpc.account.whoami.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { updateVotingToken, removeVotingToken } = usePolls({});

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
      url: `${window.location.host}/vote?=${votingToken.id}`,
      title: pollName,
      text: `${whoaimData?.whoami?.displayName} would like you to participate in a movie poll.`,
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
        {inviteData && canShare && canShare(inviteData) && (
          <Button
            type="button"
            onClick={(e) => {
              share(inviteData).then(() => {
                updateVotingToken({
                  ...votingToken,
                  unshared: false,
                });
              });
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
            removeVotingToken(
              {
                id: votingToken.id,
                pollId: votingToken.pollId,
              },
              {
                onSuccess: () => {
                  // updates poll progress bar
                  router.refresh();
                },
              }
            );
          }}
          title="Remove Invite"
        >
          <span className="material-symbols-rounded">delete</span>
        </Button>
      </div>
    </div>
  );
};

const VotingTokens: React.FC<{
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

  const votingTokens = useMemo(
    () =>
      votingTokensData?.tokens.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [votingTokensData?.tokens]
  );

  const { addVotingTokens } = usePolls({});

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
            placeholder={'Number of new invite links'}
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
                      router.refresh();
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
              pollId={poll.id}
              index={index}
            />
          </li>
        ))}
      </ul>
    </article>
  );
};

const Movie: React.FC<{
  id: PollType['MoviePoll']['0']['movieId'];
  onRemove?: (movieId: number) => void;
  progress?: number;
}> = ({ id, onRemove, progress }) => {
  const { movie, isLoading } = useMovie({ movieId: id });

  if (isLoading || !movie) return null;

  return (
    <div className={styles['movie']}>
      <Card
        header={{
          backdropImage: <MovieBackdrop movie={movie} isBackdrop />,
        }}
      >
        <div className={styles['backdrop-shadow']} />
        <div className={styles['movie-details']}>
          <MovieDetails movie={movie} />
          <div className={styles['movie-actions']}>
            <MoviePanels movie={movie} hidePollsTab defaultTab="Available On" />
            {!!onRemove && (
              <Button
                onClick={() => {
                  onRemove(movie.id);
                }}
                del
                type="button"
              >
                REMOVE
              </Button>
            )}
            {typeof progress !== 'undefined' && (
              <div className={styles['poll-progress']}>
                <span>Progress</span>
                <ProgressBar value={progress} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const MovieList: React.FC<{
  movies: PollType['MoviePoll'];
  onRemove?: (movieId: number) => void;
}> = ({ movies, onRemove }) => {
  const [totalVotes, setTotalVotes] = useState(
    movies.reduce((prev, acc) => {
      if (!prev) return acc.voteCount ?? 0;

      return prev + (acc.voteCount ?? 0);
    }, 0)
  );

  useEffect(() => {
    setTotalVotes(
      movies.reduce((prev: number, acc) => {
        if (!prev) return acc.voteCount ?? 0;

        return prev + (acc.voteCount ?? 0);
      }, 0)
    );
  }, [movies]);

  return (
    <section className={styles['movie-list']}>
      {movies.map((movie) => (
        <Movie
          key={movie.movieId}
          id={movie.movieId}
          onRemove={onRemove}
          progress={
            totalVotes
              ? Math.round(((movie.voteCount ?? 0) / totalVotes) * 100)
              : 0
          }
        />
      ))}
    </section>
  );
};

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
    <article className={styles['active-poll']}>
      <header className={styles['header']}>
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
          <div className={styles['poll-progress']}>
            <span>Poll Progress</span>
            <PollProgress poll={poll} />
          </div>
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
        <VotingTokens poll={poll} />
      </header>
      <MovieList movies={poll.MoviePoll} />
    </article>
  );
};

const InactivePoll: React.FC<{
  poll: PollType;
  onRemoveMovie: (movieId: number) => void;
  onUpdate: (
    ...args: Parameters<ReturnType<typeof usePolls>['updatePoll']>
  ) => void;
}> = ({ poll, onRemoveMovie, onUpdate }) => {
  const now = new Date();
  const endDateTemp = new Date();

  const { getServerDateFromClientDate } = useDate();
  const [pollName, setPollName] = useState(poll.name);
  const [endDate, setEndDate] = useState(
    poll.expiresOn ||
      new Date(endDateTemp.setDate(endDateTemp.getDate() + 1)).toISOString()
  );
  const [maxDate, setMaxDate] = useState<Date>();

  useEffect(() => {
    setMaxDate(new Date(now.setDate(now.getDate() + 28)));
    setEndDate(
      poll.expiresOn ||
        new Date(
          endDateTemp.setHours(endDateTemp.getHours() + 12)
        ).toISOString()
    );
  }, []);

  return (
    <article className={styles['inactive-poll']}>
      <header className={styles['header']}>
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
              if (poll.MoviePoll.length < 2) return;

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
            disabled={poll.MoviePoll.length < 2}
            outlined
            type="button"
          >
            START POLL
          </Button>
        </div>
        <VotingTokens poll={poll} />
      </header>
      <MovieList
        movies={poll.MoviePoll}
        onRemove={(movieId) => {
          // TODO: update only on success
          onRemoveMovie(movieId);
        }}
      />
    </article>
  );
};

const Poll: React.FC<{ poll: InferQueryOutput<'poll'>['getPoll']['poll'] }> = ({
  poll,
}) => {
  const router = useRouter();
  const {
    poll: { votingTokens },
  } = trpc.useContext();
  const { removeMovie, updatePoll, isSuccessUpdatePoll, isSuccessRemoveMovie } =
    usePolls({});

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
    <section className={styles['poll']}>
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
          onRemoveMovie={(movieId) => {
            removeMovie({ movieId, pollId: poll.id });
          }}
          onUpdate={(p) => {
            updatePoll(p);
          }}
        />
      )}
    </section>
  );
};

export default Poll;
