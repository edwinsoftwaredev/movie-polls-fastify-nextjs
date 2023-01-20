import { MovieProviders } from 'types';
import JustWatchLogo from 'public/justwatch-logos/justwatch-logo.svg';

interface StreamingOnProps {
  flatrate: MovieProviders['flatrate'] | undefined;
}

const StreamingOn: React.FC<StreamingOnProps> = ({ flatrate }) => {
  return (
    <div>
      <ul>
        {flatrate?.map((item) => (
          <li key={item.provider_id}>{item.provider_name}</li>
        ))}
      </ul>
      <div>
        <span>
          Powered by <JustWatchLogo width="5.5rem" />
        </span>
      </div>
    </div>
  );
};

export default StreamingOn;
