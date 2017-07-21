import API = require('simple-youtube-api');
import ytdl = require('ytdl-core');

import { IFetchable } from '../interfaces/IFetchable';
import { IService } from '../interfaces/IService';
import YouTubeSong from '../songs/YouTube';

export default class YouTubeService implements IService {
  public readonly api: API;
  public search: boolean = true;

  constructor(key: string) {
    this.api = new API(key);
  }

  public async fetch(fetchable: IFetchable) {
    const fetched: YouTubeSong[] = [];

    for (const playlist of fetchable.playlists) {
      const p = await this.api.getPlaylist(playlist);
      fetched.push(...p.videos.map((v) => this.formatSong(v, playlist)));
    }

    for (const song of fetchable.songs) {
      fetched.push(this.formatSong(await this.api.getVideo(song)));
    }

    if (this.search) {
      for (const query of fetchable.queries) {
        const results = await this.api.searchVideos(query, 1);
        if (results.length) fetched.push(this.formatSong(results[0]));
      }
    }

    return fetched;
  }

  public fetchable(content: string) {
    const words = content.split(' ');
    const query = [];
    const addable: IFetchable = {
      playlists: [],
      queries: [],
      songs: [],
    };

    for (const elem of words) {
      const parsed = API.util.parseURL(elem);
      if (!parsed) {
        query.push(elem);
      } else if (parsed.type === 'video') {
        addable.songs.push(parsed.id);
      } else if (parsed.type === 'playlist') {
        addable.playlists.push(parsed.id);
      }
    }

    addable.queries.push(query.join(' '));

    return addable;
  }

  public formatSong(video: API.Video, playlistID?: string): YouTubeSong {
    return new YouTubeSong(this, {
      playlistID,
      title: video.title,
      trackID: video.id,
    });
  }
}
