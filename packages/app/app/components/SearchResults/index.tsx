import React from 'react';
import _ from 'lodash';
import { Tab } from 'semantic-ui-react';
import { useTranslation, withTranslation } from 'react-i18next';
import { Card } from '@nuclear/ui';

import AllResults from './AllResults';
import TracksResults from './TracksResults';
import PlaylistResults from './PlaylistResults';

import styles from './styles.scss';
import * as SearchActions from '../../actions/search';
import * as QueueActions from '../../actions/queue';
import * as PlayerActions from '../../actions/player';
import { RootState } from '../../reducers';
import { useHistory } from 'react-router-dom';
import { LastfmTrackMatchInternal } from '@nuclear/core/src/rest/Lastfm.types';
import { YoutubeResult } from '@nuclear/core/src/rest/Youtube';

type SearchResultsProps = RootState['search'] & 
typeof SearchActions &
typeof QueueActions &
typeof PlayerActions & 
RootState['plugin']['plugins'] &
{
  selectedPlugins: RootState['plugin']['selected']
}

const SearchResults: React.FC<SearchResultsProps> = ({
  unifiedSearchStarted,
  playlistSearchStarted,
  playlistSearchResults,
  artistSearchResults,
  albumSearchResults,
  trackSearchResults,
  liveStreamSearchResults,
  podcastSearchResults,
  albumInfoSearch,
  artistInfoSearch,
  podcastSearch,
  metaProviders,
  selectedPlugins,
  addToQueue,
  clearQueue,
  startPlayback,
  selectSong,
  streamProviders,
  ...rest
}) => {
  const { t } = useTranslation('search');
  const history = useHistory();

  const onAlbumInfoSearch = (albumId, releaseType, release) => {
    albumInfoSearch(albumId, releaseType, release);
    history.push('/album/' + albumId);
  };

  const onArtistInfoSearch = (artistId) => {
    artistInfoSearch(artistId);
    history.push('/artist/' + artistId);
  };

  const onPodcastInfoSearch = (podcastId, releaseType, release) => {
    podcastSearch(podcastId);
    history.push('/album/' + podcastId);
  };

  const renderAllResultsPane = () => {
    return (
      <Tab.Pane loading={unifiedSearchStarted} attached={false}>
        <div className={styles.pane_container}>
          <div className={styles.row}>
            <AllResults
              {...rest}
              albumInfoSearch={onAlbumInfoSearch}
              artistInfoSearch={onArtistInfoSearch}
              podcastInfoSearch={onPodcastInfoSearch}
            />
          </div>
        </div>
      </Tab.Pane >
    );
  };

  const renderPane = (collection, onClick) => {
    const selectedProvider = _.find(metaProviders, { sourceName: selectedPlugins.metaProviders });

    return (
      <Tab.Pane loading={unifiedSearchStarted} attached={false}>
        <div className={styles.pane_container}>
          {collection.length > 0
            ? unifiedSearchStarted
              ? null
              : collection.map((el, i) => {
                const id = _.get(el, `ids.${selectedProvider.searchName}`, el.id);
                return (
                  <Card
                    key={'title-card-' + i}
                    header={el.title || el.name}
                    content={el.artist}
                    image={
                      el.coverImage ||
                      el.thumb
                    }
                    onClick={() => onClick(id, el.type)}
                  />
                );
              })
            : t('empty')}
        </div>
      </Tab.Pane>
    );
  };

  const renderTrackListPane= (collection) => {
    if (typeof collection !== 'undefined') {

      return (
        <Tab.Pane loading={unifiedSearchStarted} attached={false}>
          <div className={styles.pane_container}>
            {collection.length > 0
              ? unifiedSearchStarted
                ? null
                : <TracksResults tracks={collection} limit='15' />
              : t('empty')}
          </div>
        </Tab.Pane>
      );
    } else {
      return (
        <Tab.Pane
          loading={unifiedSearchStarted}
          attached={false}
        >
          <div className={styles.pane_container}>{t('empty')}</div>
        </Tab.Pane>
      );
    }
  };

  const renderPlaylistPane = () => {
    return (
      <Tab.Pane attached={false}>
        <PlaylistResults
          playlistSearchStarted={playlistSearchStarted}
          playlistSearchResults={playlistSearchResults}
          addToQueue={addToQueue}
          clearQueue={clearQueue}
          startPlayback={startPlayback}
          selectSong={selectSong}
          streamProviders={streamProviders}
        />
      </Tab.Pane>
    );
  };

  const panes = () => {
    const artistsHasResults = _.get(artistSearchResults, ['length'], 0) > 0;
    const albumsHasResults = _.get(albumSearchResults, ['length'], 0) > 0;
    const tracksHasResults = _.get(trackSearchResults, ['info', 'length'], 0) > 0;
    const playlistsHasResults = _.get(playlistSearchResults, ['info', 'length'], 0) > 0;
    const liveStreamsHasResults = _.get(liveStreamSearchResults, ['info', 'length'], 0) > 0;
    const podcastsHasResults = _.get(podcastSearchResults, ['length'], 0) > 0;

    const panes = [
      {
        menuItem: t('all'),
        render: () => renderAllResultsPane()
      },
      artistsHasResults && {
        menuItem: t('artist_plural'),
        render: () =>
          renderPane(
            artistSearchResults,
            artistInfoSearch
          )
      },
      albumsHasResults && {
        menuItem: t('album_plural'),
        render: () =>
          renderPane(
            albumSearchResults,
            albumInfoSearch
          )
      },
      tracksHasResults && {
        menuItem: t('track_plural'),
        render: () => renderTrackListPane(
          isTrackSearchResult(trackSearchResults) &&
          trackSearchResults.info
        )
      },
      playlistsHasResults && {
        menuItem: t('playlist'),
        render: () => renderPlaylistPane()
      },
      liveStreamsHasResults && {
        menuItem: t('live-stream'),
        render: () => renderTrackListPane(
          isTrackSearchResult(liveStreamSearchResults) &&
          liveStreamSearchResults.info
        )
      },
      podcastsHasResults && {
        menuItem: t('podcast'),
        render: () =>
          renderPane(
            podcastSearchResults,
            onPodcastInfoSearch
          )
      }
    ].filter(pane => !!pane);

    return panes;
  };


  return (
    <div>
      <Tab menu={{ secondary: true, pointing: true }} panes={panes()} />
    </div>
  );
};

const isTrackSearchResult = (result: any): result is {info: LastfmTrackMatchInternal | YoutubeResult } => {
  return result.info !== undefined;
};


export default SearchResults;
