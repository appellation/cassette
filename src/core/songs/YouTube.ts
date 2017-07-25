import { Readable as ReadableStream } from 'stream';
import ytdl = require('ytdl-core');

import YouTube from '../services/YouTube';
import Song from '../Song';

export default class YouTubeSong extends Song {
  public readonly type: string = 'youtube';
  public readonly title: string;
  public readonly playlistID?: string;
  public readonly trackID: string;

  constructor(service: YouTube, data: { title: string, playlistID?: string, trackID: string }) {
    super(service);

    this.title = data.title;
    this.playlistID = data.playlistID;
    this.trackID = data.trackID;
  }

  public stream() {
    return ytdl(`https://www.youtube.com/watch?${this.trackID}`, {
      filter: 'audioonly',
      quality: 'lowest',
    });
  }

  public async next() {
    return null;
  }
}
