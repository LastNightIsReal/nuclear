import React from 'react';
import _ from 'lodash';
import { Card } from '@nuclear/ui';
import { useTranslation } from 'react-i18next';

import artPlaceholder from '../../../../resources/media/art_placeholder.png';

import PlaylistResults from '../PlaylistResults';
import TracksResults from '../TracksResults';
import * as QueueActions from '../../../actions/queue';
import * as PlayerActions from '../../../actions/player';
import * as SearchActions from '../../../actions/search';

import styles from './styles.scss';
import { RootState } from '../../../reducers';
import { isFullyLoadedPlaylistResult, isFullyLoadedTrackResult } from '../../../actions/search';

type AllResultsProps = RootState['plugin']['plugins'] &
  RootState['search'] &
  typeof QueueActions &
  typeof PlayerActions &
  typeof SearchActions &
{
  selectedPlugins: RootState['plugin']['selected']
};

export const AllResults: React.FC<AllResultsProps> = ({
  metaProviders,
  selectedPlugins,
  addToQueue,
  playlistSearchStarted,
  playlistSearchResults,
  artistSearchResults,
  artistInfoSearch,
  albumSearchResults,
  albumInfoSearch,
  trackSearchResults

}) => {
  const { t } = useTranslation('search');

  const renderResults = (collection, onClick) => {
    const selectedProvider = _.find(metaProviders, { sourceName: selectedPlugins.metaProviders });

    return collection.slice(0, 5).map((el, i) => {
      const id = _.get(el, `ids.${selectedProvider.searchName}`, el.id);

      return (
        <Card
          header={el.title || el.name}
          image={
            el.coverImage ||
            el.thumb ||
            el.thumbnail ||
            artPlaceholder
          }
          content={el.artist}
          onClick={() => onClick(id, el.type, el)}
          key={'item-' + i}
        />
      );
    });
  };

  const renderSection = (title, collection, onClick) => {
    return (<div className={styles.column}>
      <h3>{title}</h3>
      <div className={styles.row}>
        {renderResults(
          collection,
          onClick
        )}
      </div>
    </div>);
  };

  const tracksLength = isFullyLoadedTrackResult(trackSearchResults) ? trackSearchResults.info?.length : 0;
  const artistsLength = artistSearchResults?.length ?? 0;
  const albumsLength = albumSearchResults?.length ?? 0;
  const playlistsLength = isFullyLoadedPlaylistResult(playlistSearchResults) ? playlistSearchResults?.info?.length : 0;
  if (tracksLength + artistsLength + albumsLength + playlistsLength === 0) {
    return <div>{t('empty')}</div>;
  }

  return (
    <div className={styles.all_results_container}>
      {artistsLength > 0 && renderSection(t('artist', { count: artistSearchResults.length }), artistSearchResults, artistInfoSearch)}
      {albumsLength > 0 && renderSection(t('album', { count: albumSearchResults.length }), albumSearchResults, albumInfoSearch)}
      {tracksLength > 0 && isFullyLoadedTrackResult(trackSearchResults) &&
        (<div className={styles.column}>
          <h3>{t('track_plural')}</h3>
          <div className={styles.row}>
            <TracksResults
              tracks={trackSearchResults.info}
              limit={5} 
            />
          </div>
        </div>
        )}
      {playlistsLength > 0 && <div className={styles.column}>
        <h3>{t('playlist', { count: isFullyLoadedPlaylistResult(playlistSearchResults) ? playlistSearchResults.info.length : 0 })}</h3>
        <div className={styles.row}>
          <PlaylistResults
            playlistSearchStarted={playlistSearchStarted}
            playlistSearchResults={playlistSearchResults}
            addToQueue={addToQueue}
          />
        </div>
      </div>}
    </div>
  );
};

export default AllResults;
