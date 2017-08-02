import API = require('simple-youtube-api');
import ytdl = require('ytdl-core');

import { SearchType } from '../../core/Playlist';
import { IFetchable } from '../../interfaces/IFetchable';
import { IService } from '../../interfaces/IService';
import YouTubeSong from './Song';

export default class YouTubeService implements IService {
  public readonly api: API;
  public search: boolean = true;

  constructor(key: string) {
    this.api = new API(key);
  }

  public async fetch(fetchable: IFetchable, searchType?: SearchType) {
    const fetched: YouTubeSong[] = [];

    for (const playlist of fetchable.playlists) {
      const p = await this.api.getPlaylistByID(playlist);
      await p.getVideos();
      fetched.push(...p.videos.map((v) => new YouTubeSong(this, v, playlist)));
    }

    for (const song of fetchable.songs) {
      fetched.push(new YouTubeSong(this, await this.api.getVideoByID(song)));
    }

    if (this.search) {
      for (const query of fetchable.queries) {
        if (searchType === 'playlist') {
          const results = await this.api.searchPlaylists(query, 1);
          if (results.length) {
            const list = results[0];
            const videos = await list.getVideos();
            fetched.push(...videos.map((v) => new YouTubeSong(this, v, list.id)));
          }
        } else {
          const results = await this.api.searchVideos(query, 1);
          if (results.length) fetched.push(new YouTubeSong(this, results[0]));
        }
      }
    }

    return fetched;
  }

  public fetchable(content: string) {
    const words = content.split(' ');
    const query = [];
    const fetchable: IFetchable = {
      playlists: [],
      queries: [],
      songs: [],
    };

    for (const elem of words) {
      const parsed = API.util.parseURL(elem);
      if (!parsed) {
        query.push(elem);
      } else if (parsed.type === 'video') {
        fetchable.songs.push(parsed.id);
      } else if (parsed.type === 'playlist') {
        fetchable.playlists.push(parsed.id);
      }
    }

    const joined = query.join(' ');
    if (joined.length) fetchable.queries.push(joined);

    return fetchable;
  }
}
