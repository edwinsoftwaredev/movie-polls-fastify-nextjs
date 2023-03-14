import { useMovieDetails } from 'hooks';
import { ComponentProps, useState } from 'react';
import { Movie } from 'types';
import Panel from '../Panel';
import AvailableOn from './panels/AvailableOn';
import Polls from './panels/Polls';
import Poster from './panels/Poster';

const tabs: ComponentProps<typeof Panel>['tabs'] = [
  { title: 'Title', icon: 'image' },
  { title: 'Polls', icon: 'fact_check' }, // ?
  { title: 'Available On', icon: 'subscriptions' },
];

const MoviePanels: React.FC<{
  movie: Movie;
  defaultTab?: 'Title' | 'Polls' | 'Available On';
  hideTitleTab?: boolean;
  hidePollsTab?: boolean;
  hideAvailableTab?: boolean;
}> = ({ movie, defaultTab, hidePollsTab }) => {
  const [currentTab, setCurrentTab] = useState(
    (defaultTab as string) || 'Title'
  );

  const { title, providers } = useMovieDetails(
    movie,
    false,
    currentTab === 'Available On'
  );

  return (
    <Panel
      tabs={tabs.filter((tab) => (hidePollsTab ? tab.title !== 'Polls' : true))}
      onTabClick={(tabTitle) => {
        setCurrentTab(tabTitle);
      }}
      defaultActiveTab={defaultTab || 'Title'}
    >
      {currentTab === 'Title' ? <Poster movie={movie} /> : null}
      {currentTab === 'Available On' ? (
        <AvailableOn providers={providers} movieTitle={title} />
      ) : null}
      {currentTab === 'Polls' ? <Polls movieId={movie.id} /> : null}
    </Panel>
  );
};

export default MoviePanels;
