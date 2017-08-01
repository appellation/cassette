export * from './interfaces/IFetchable';
export * from './interfaces/IService';

import Client from './core/Client';
import Playlist from './core/Playlist';
import Song from './core/Song';

import YouTubeService from './external/youtube/Service';
import YouTubeSong from './external/youtube/Song';

import DiscordPlaylist from './players/DiscordPlaylist';

export {
  Client,
  Playlist,
  Song,

  YouTubeService,
  YouTubeSong,

  DiscordPlaylist,
};
