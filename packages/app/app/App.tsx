import React, { useEffect } from 'react';

import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { PluginConfig } from '@nuclear/core';
import * as PluginsActions from './actions/plugins';
import * as SettingsActions from './actions/settings';
import * as ScrobblingActions from './actions/scrobbling';
import * as ImportFavActions from './actions/importfavs';
import * as ConnectivityActions from './actions/connectivity';
import * as GithubContribActions from './actions/githubContrib';
import * as WindowActions from './actions/window';
import * as NuclearConfigActions from './actions/nuclear/configuration';

import './app.global.scss';
import styles from './styles.scss';
import compact from './compact.scss';

import logoIcon from '../resources/media/512x512.png';

import Navbar from './components/Navbar';
import VerticalPanel from './components/VerticalPanel';
import Spacer from './components/Spacer';

import HelpModalContainer from './containers/HelpModalContainer';
import MainContentContainer from './containers/MainContentContainer';
import PlayQueueContainer from './containers/PlayQueueContainer';
import SearchBoxContainer from './containers/SearchBoxContainer';
import PlayerBarContainer from './containers/PlayerBarContainer';
import MiniPlayerContainer from './containers/MiniPlayerContainer';

import IpcContainer from './containers/IpcContainer';
import SoundContainer from './containers/SoundContainer';
import ToastContainer from './containers/ToastContainer';
import ShortcutsContainer from './containers/ShortcutsContainer';
import ErrorBoundary from './containers/ErrorBoundary';

import NavButtons from './components/NavButtons';
import WindowControls from './components/WindowControls';
import SidebarMenuContainer from './containers/SidebarMenuContainer';
import { CommandPaletteContainer } from './containers/CommandPaletteContainer';
import { RootState } from './reducers';

type AppProps = {
  queue: RootState['queue'],
  player: RootState['player'],
  scrobbling: RootState['scrobbling'],
  settings: RootState['settings'],
  isConnected: boolean,
  actions: typeof ConnectivityActions &
    typeof ScrobblingActions &
    typeof ImportFavActions &
    typeof SettingsActions &
    typeof PluginsActions &
    typeof GithubContribActions &
    typeof WindowActions &
    typeof NuclearConfigActions
}

export const App: React.FC<AppProps> = ({
  settings,
  actions
}: AppProps) => {
  const updateConnectivityStatus = (isConnected) => {
    actions.changeConnectivity(isConnected);
  };

  const renderRightPanel = () => {
    return (
      <VerticalPanel
        className={classnames(styles.right_panel, {
          [`${compact.compact_panel}`]: settings.compactQueueBar
        })}
      >
        <PlayQueueContainer />
      </VerticalPanel>
    );
  };

  useEffect(() => {
    actions.readSettings();
    actions.lastFmReadSettings();
    actions.FavImportInit();
    actions.createPlugins(PluginConfig.plugins);
    actions.deserializePlugins();
    actions.githubContribInfo();
    actions.fetchNuclearConfiguration();
    actions.fetchNuclearParams();

    updateConnectivityStatus(navigator.onLine);
    window.addEventListener('online', () => updateConnectivityStatus(true));
    window.addEventListener('offline', () => updateConnectivityStatus(false));
  }, []);

  return (
    <ErrorBoundary>
      <div className={styles.app_container}>
        <MiniPlayerContainer />
        <Navbar>
          <div className={styles.sidebar_brand}>
            <img src={logoIcon} />
          </div>
          <NavButtons />
          <SearchBoxContainer />
          <Spacer className={styles.navbar_spacer} />
          <HelpModalContainer />
          {settings.framelessWindow && (
            <WindowControls
              onCloseClick={actions.closeWindow}
              onMaxClick={actions.maximizeWindow}
              onMinClick={actions.minimizeWindow}
            />
          )}
        </Navbar>
        <div className={styles.panel_container}>
          <SidebarMenuContainer />
          <VerticalPanel className={styles.center_panel}>
            <MainContentContainer />
          </VerticalPanel>
          {renderRightPanel()}
        </div>
        <PlayerBarContainer />
        <SoundContainer />
        <IpcContainer />
      </div>
      <CommandPaletteContainer />
      <ShortcutsContainer />
      <ToastContainer />
    </ErrorBoundary>
  );
};
