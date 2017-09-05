import { Readable as ReadableStream } from 'stream';
import Song from '../../core/Song';
import { Track } from '../../typings/Soundcloud';
import SoundcloudService from './Service';

export default class SoundcloudSong extends Song {
  public readonly type = 'soundcloud';
  public readonly title: string;
  public readonly playlistID?: number;
  public readonly trackID: number;
  public readonly streamURL: string;

  constructor(service: SoundcloudService, track: Track, playlistID?: number) {
    super(service);

    this.title = track.title;
    this.trackID = track.id;
    this.streamURL = track.stream_url;
    this.playlistID = playlistID;
  }

  public async stream(): Promise<ReadableStream> {
    const svc = this.service as SoundcloudService;
    const result = await svc.request.get(this.streamURL, {
      responseType: 'stream',
    });

    return result.data;
  }

  public async next(): Promise<null> {
    return null;
  }
}
