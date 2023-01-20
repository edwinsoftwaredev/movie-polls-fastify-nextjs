import { MovieProviders } from 'types';
import JustWatchLogo from 'public/justwatch-logos/justwatch-logo.svg';

interface BuyOnProps {
  rent: MovieProviders['rent'] | undefined;
  buy: MovieProviders['buy'] | undefined;
}

const BuyOn: React.FC<BuyOnProps> = ({ rent, buy }) => {
  return (
    <div>
      <ul>
        {rent?.map((item) => (
          <li key={item.provider_id}>{item.provider_name}</li>
        ))}
      </ul>
      <ul>
        {buy?.map((item) => (
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

export default BuyOn;
