import React from 'react';
import { NuclearImage } from '../..';
import artPlaceholder from '../../resources/media/art_placeholder.png';

export default {
  title: 'Components/Nuclear image'
};

export const Example = () => <NuclearImage
  src='https://i.imgur.com/4euOws2.jpg'
  Loader={({className}) => <img className={className} src={artPlaceholder} />}
/>;

export const Error = () => <NuclearImage
  src='https://example.com/does-not-exist.jpg'
  Loader={({className}) => <img className={className} src={artPlaceholder} />}
  Error={({className}) => <div className={className}>Error</div>}
/>;
