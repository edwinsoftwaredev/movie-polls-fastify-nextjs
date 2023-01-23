import JustWatchLogo from 'public/justwatch-logos/justwatch-logo.svg';
import { useMovieDetails } from 'hooks';
import styles from './AvailableOn.module.scss';
import TMBDLogo from 'public/tmdb-logos/blue_square.svg';

const skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8];

const SkeletonItems: React.FC<{ title: string }> = ({ title }) => (
  <section>
    <h4>{title}</h4>
    <div>
      {skeletonItems.map((item) => (
        <div key={item} className={styles['skeleton-item']} />
      ))}
    </div>
  </section>
);

const AvailableOnListSkeleton: React.FC = () => {
  return (
    <div className={styles['list']}>
      <SkeletonItems title="Streaming On" />
      <SkeletonItems title="Rent On" />
      <SkeletonItems title="Buy On" />
    </div>
  );
};

const ProviderItem: React.FC<{
  provider: ReturnType<typeof useMovieDetails>['providers']['flatrate'][0];
}> = ({ provider }) => (
  <img
    key={provider?.provider_id}
    src={`${process.env.NEXT_PUBLIC_TMDB_IMAGES_URL}/t/p/original${provider?.logo_path}`}
    title={provider?.provider_name}
  />
);

const Provider: React.FC<{
  title: string;
  providers: ReturnType<typeof useMovieDetails>['providers']['flatrate'];
}> = ({ title, providers }) =>
  providers.length ? (
    <section>
      <h4>{title}</h4>
      <div>
        {providers?.map((item) => (
          <ProviderItem key={item.provider_id} provider={item} />
        ))}
      </div>
    </section>
  ) : null;

interface StreamingOnProps {
  // TODO: Refactor
  movieTitle: string;
  providers: ReturnType<typeof useMovieDetails>['providers'];
}

const AvailableOn: React.FC<StreamingOnProps> = ({ providers, movieTitle }) => {
  return (
    <div className={styles['available-on-container']}>
      {providers.isProvidersDataFetched ? (
        <div className={styles['list']}>
          <Provider title="Streaming On" providers={providers.flatrate} />
          <Provider title="Rent On" providers={providers.rent} />
          <Provider title="Buy On" providers={providers.buy} />
        </div>
      ) : (
        <AvailableOnListSkeleton />
      )}
      <div className={styles['credits']}>
        <span>
          <a
            href={providers.link}
            title={'Visit TMDB'}
            referrerPolicy="no-referrer"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <TMBDLogo width="2.2em" />
          </a>
        </span>
        <span>
          Source: <JustWatchLogo width="6.5em" />
        </span>
      </div>
    </div>
  );
};

export default AvailableOn;
