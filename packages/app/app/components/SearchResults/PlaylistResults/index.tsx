import React from 'react';

import TracksResults from '../TracksResults';
import FontAwesome from 'react-fontawesome';
import artPlaceholder from '../../../../resources/media/art_placeholder.png';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import * as QueueActions from '../../../actions/queue';
import * as PlayerActions from '../../../actions/player';

import styles from './styles.scss';
import { Track } from '@nuclear/ui/lib/types';
import { SearchState } from '../../../reducers/search';
import { PluginsState } from '../../../reducers/plugins';
import { isFullyLoadedPlaylistResult } from '../../../actions/search';
import { PlayQueueActions } from '../../../containers/PlayQueueContainer';

type PlaylistResulstsProps = {
   playlistSearchStarted: SearchState['playlistSearchStarted'],
    playlistSearchResults: SearchState['playlistSearchResults'],
    addToQueue: PlayQueueActions['addToQueue']
 };

const PlaylistResults: React.FC<PlaylistResulstsProps> = ({
  addToQueue,
  playlistSearchResults,
  playlistSearchStarted
}) => {
  const { t } = useTranslation('search');

  const addTrack = (track: Track) => {
    if (track === undefined) {
      addToQueue({
        artist: track.artist,
        name: track.name,
        thumbnail: track.thumbnail ?? _.get(track, 'image[1][\'#text\']', artPlaceholder)
      });
    }
  };

  const renderAddAllButton = (tracks: Track[]) => {
    return (tracks.length > 0 ? <a
      key='add-all-tracks-to-queue'
      href='#'
      onClick={() => {
        tracks
          .map(track => {
            addTrack(track);
          });
      }}
      className={styles.add_button}
      aria-label={t('queue-add')}
    >
      <FontAwesome name='plus' /> Add all
    </a> : null
    );
  };
  const renderLoading =() => {
    return (<div>Loading... <FontAwesome name='spinner' pulse /></div>);
  };

  const renderResults = () =>
    isFullyLoadedPlaylistResult(playlistSearchResults) && 
    <div>
      {renderAddAllButton(playlistSearchResults.info)}
      <TracksResults
        tracks={playlistSearchResults.info}
        limit='100'
      /></div>;

  const renderNoResult = () => {
    return (<div>{t('empty')}</div>);
  };

  return  playlistSearchStarted 
    ? ((typeof playlistSearchStarted !== 'boolean' && playlistSearchStarted.length > 0 && !isFullyLoadedPlaylistResult(playlistSearchResults)) 
      ? renderLoading() 
      : renderResults()) 
    : renderNoResult();
};

export default PlaylistResults;
