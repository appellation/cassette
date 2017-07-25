export * from './interfaces/IFetchable';
export * from './interfaces/IService';

import Client from './core/Client';
import Playlist from './core/Playlist';
import Song from './core/Song';

import YouTubeService from './core/services/YouTube';
import YouTubeSong from './core/songs/YouTube';

import DiscordPlaylist from './extensions/Discord.js';

export {
  Client,
  Playlist,
  Song,

  YouTubeService,
  YouTubeSong,

  DiscordPlaylist,
};
