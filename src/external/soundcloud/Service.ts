import axios, { AxiosInstance } from 'axios';
import url = require('url');

import { SearchType } from '../../core/Playlist';
import SoundcloudSong from './Song';

import { IFetchable } from '../../interfaces/IFetchable';
import { IService } from '../../interfaces/IService';

import { Playlist, Track } from '../../typings/Soundcloud';

export default class SoundcloudService implements IService {
  public static isViewURL(test: string) {
    const parsed = url.parse(test);
    if (!parsed.pathname || !parsed.hostname) return false;
    const parts = parsed.pathname.split('/');
    return (parsed.hostname === 'soundcloud.com' || parsed.hostname === 'www.soundcloud.com') && parts.length >= 2;
  }

  public readonly request: AxiosInstance;
  public search: boolean = false;

  constructor(key: string) {
    this.request = axios.create({
      baseURL: 'https://api.soundcloud.com',
      params: {
        client_id: key,
      },
    });
  }

  public formatSongs(songs: Track[], playlistID?: number): SoundcloudSong[] {
    return songs.filter((t) => t.streamable).map((t) => new SoundcloudSong(this, t, playlistID));
  }

  public async fetch(fetchable: IFetchable, searchType?: SearchType): Promise<SoundcloudSong[]> {
    const songs: SoundcloudSong[] = [];

    for (const resource of fetchable.playlists.concat(fetchable.songs)) {
      const result = await this.request.get('/resolve', {
        params: { url: resource },
      });

      switch (result.data.kind) {
        case 'playlist':
          songs.push(...this.formatSongs(result.data.tracks, result.data.id));
          break;
        case 'track':
          songs.push(...this.formatSongs([result.data]));
          break;
      }
    }

    if (this.search) {
      for (const query of fetchable.queries) {
        if (searchType === 'playlist') {
          const result = await this.request.get('/playlists', {
            params: { q: query },
          });

          songs.push(...this.formatSongs(result.data[0].tracks, result.data[0].id));
        } else {
          const result = await this.request.get('/tracks', {
            params: { q: query },
          });

          songs.push(...this.formatSongs([result.data[0]]));
        }
      }
    }

    return songs;
  }

  public fetchable(content: string): IFetchable {
    const words = content.split(' ');
    const fetchable: IFetchable = {
      playlists: [],
      queries: [],
      songs: [],
    };

    const search = [];
    for (const word of words) {
      if (SoundcloudService.isViewURL(word)) fetchable.songs.push(word);
      else search.push(word);
    }

    fetchable.queries.push(search.join(' '));
    return fetchable;
  }
}
