import React, { useEffect } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

import * as TagActions from '../../actions/tag';
import * as SearchActions from '../../actions/search';
import * as QueueActions from '../../actions/queue';
import TagDescription from './TagDescription';
import TagHeader from './TagHeader';
import TagTopList from './TagTopList';
import TagTopTracks from './TagTopTracks';
import styles from './styles.scss';
import { useHistory } from 'react-router-dom';
import { isUndefined } from 'lodash';

type TagViewProps = typeof TagActions &
typeof SearchActions &
typeof QueueActions &
{
  tag: string;
  tags: Tag[];
}

type Tag = {
  tag: {
    name: string;
    url: string;
    reach: string;
    taggings: string;
  };
  loading?: boolean;
  tracks: {
    track: TagTopElement[]
  }[];
  albums: {
    album: TagTopElement[]
  }[];
  topartists: {
    artist: TagTopElement[]
  }[];
}

type TagTopElement = {
  name: string;
  mbid: string;
  url: string;
  image: {
    '#text': string;
  }
}


const TagView = ({
  loadTagInfo,
  artistInfoSearchByName,
  albumInfoSearchByName,
  addToQueue,
  tag,
  tags
}: TagViewProps) => {
  const { t } = useTranslation('tags');
  const history = useHistory();

  useEffect(() => {
    loadTagInfo(tag);
  }, []);

  let tagInfo: Tag;
  let topTracks: TagTopElement;
  let topAlbums: TagTopElement;
  let topArtists: TagTopElement;
  if (tags[tag] && tags[tag].loading !== true) {
    tagInfo = tags[tag][0].tag;
    topTracks = tags[tag][1].tracks.track;
    topAlbums = tags[tag][2].albums.album;
    topArtists = tags[tag][3].topartists.artist;
  }

  const onArtistInfoSearchByName = (artistName: string) => {
    artistInfoSearchByName(artistName, history);
  };


  const onAlbumInfoSearchByName = (albumName: string, artistName: string) => {
    albumInfoSearchByName(albumName, artistName, history);
  };

  return (
    <div className={styles.tag_view_container}>
      <Dimmer.Dimmable>
        <Dimmer active={isUndefined(tags[tag])  || tags[tag]?.loading}>
          <Loader />
        </Dimmer>
        {typeof tags[tag] === 'undefined' || tags[tag].loading ? null : (
          <div className={styles.tag_view}>
            <TagHeader tag={tag} topArtists={topArtists} />
            <TagDescription tagInfo={tagInfo} />
            <div className={styles.lists_container}>
              <TagTopList
                topList={topArtists}
                onClick={onArtistInfoSearchByName}
                header={t('artists')}
              />
              <TagTopList
                topList={topAlbums}
                onClick={onAlbumInfoSearchByName}
                header={t('albums')}
              />
            </div>
            <TagTopTracks
              tracks={topTracks}
              addToQueue={addToQueue}
            />
          </div>
        )}
      </Dimmer.Dimmable>
    </div>
  );
};

export default TagView;
