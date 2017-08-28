import { Readable as ReadableStream } from 'stream';
import API = require('simple-youtube-api');
import ytdl = require('ytdl-core');

import Song from '../../core/Song';
import YouTubeService from './Service';

export default class YouTubeSong extends Song {
  public readonly type: string = 'youtube';
  public readonly title: string;
  public readonly playlistID?: string;
  public readonly trackID: string;
  public readonly streamURL: string;

  constructor(service: YouTubeService, video: API.Video, playlistID?: string) {
    super(service);

    this.title = video.title;
    this.trackID = video.id;
    this.streamURL = video.url;
    this.playlistID = playlistID;
  }

  public stream(): ReadableStream {
    return ytdl(encodeURI(this.streamURL), {
      filter: 'audioonly',
      quality: 'lowest',
    });
  }

  public async next(): Promise<null> {
    return null;
  }
}
