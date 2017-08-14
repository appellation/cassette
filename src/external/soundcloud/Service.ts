import axios, { AxiosInstance } from 'axios';
import url = require('url');

import { SearchType } from '../../core/Playlist';
import SoundcloudSong from './Song';

import { IFetchable } from '../../interfaces/IFetchable';
import { IService } from '../../interfaces/IService';

export type Track = {
  id: number;
  created_at: string;
  user_id: number;
  user: any;
  title: string;
  permalink: string;
  permalink_url: string;
  uri: string;
  sharing: string;
  embeddable_by: 'all' | 'me' | 'none';
  purchase_url: string;
  artwork_url: string;
  description: string;
  label: any;
  duration: number;
  genre: string;
  tag_list: string;
  label_id: number;
  label_name: string;
  release: number;
  release_day: number;
  release_month: number;
  release_year: number;
  streamable: boolean;
  downloadable: boolean;
  state: 'processing' | 'failed' | 'finished';
  license:
    'no-rights-reserved' |
    'all-rights-reserved' |
    'cc-by' |
    'cc-by-nc' |
    'cc-by-nd' |
    'cc-by-sa' |
    'cc-by-nc-nd' |
    'cc-by-nc-sa';
  track_type:
    'original' |
    'remix' |
    'live' |
    'recording' |
    'spoken' |
    'podcast' |
    'demo' |
    'in progress' |
    'stem' |
    'loop' |
    'sound effect' |
    'sample' |
    'other';
  waveform_url: string;
  download_url: string;
  stream_url: string;
  video_url: string;
  bpm: number;
  commentable: boolean;
  isrc: string;
  key_signature: string;
  comment_count: number;
  download_count: number;
  playback_count: number;
  favoritings_count: number;
  original_format: string;
  original_content_size: number;
};

export type Playlist = {
  id: number;
  created_at: string;
  user_id: number;
  user: any;
  title: string;
  permalink: string;
  permalink_url: string;
  uri: string;
  sharing: string;
  embeddable_by: 'all' | 'me' | 'none';
  purchase_url: string;
  artwork_url: string;
  description: string;
  label: any;
  duration: number;
  genre: string;
  tag_list: string;
  label_id: number;
  label_name: string;
  release: number;
  release_day: number;
  release_month: number;
  release_year: number;
  streamable: boolean;
  downloadable: boolean;
  ean: string;
  playlist_type:
    'ep single' |
    'album' |
    'compilation' |
    'project files' |
    'archive' |
    'showcase' |
    'demo' |
    'sample pack' |
    'other';
  tracks: Track[];
};

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
