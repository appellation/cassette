import { Readable as ReadableStream } from 'stream';
import ytdl = require('ytdl-core');

import Song from '../../core/Song';
import YouTubeService from './Service';

export default class YouTubeSong extends Song {
  public readonly type: string = 'youtube';
  public readonly title: string;
  public readonly playlistID?: string;
  public readonly trackID: string;

  public stream(): ReadableStream {
    return ytdl(`https://www.youtube.com/watch?v=${this.trackID}`, {
      filter: 'audioonly',
      quality: 'lowest',
    });
  }

  public async next() {
    return null;
  }
}
