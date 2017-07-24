export * from './interfaces/IFetchable';
export * from './interfaces/IService';

import Client from './core/Client';
import Playlist from './core/Playlist';
import Song from './core/Song';

import DiscordPlaylist from './extensions/Discord.js';

export {
  Client,
  Playlist,
  Song,

  DiscordPlaylist,
};
