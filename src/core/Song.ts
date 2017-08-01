import { Readable as ReadableStream } from 'stream';
import { IService } from '../interfaces/IService';

// tslint:disable-next-line interface-over-type-literal
export type SongData = { title: string, playlistID?: string, trackID: string };

export default abstract class Song {
  public readonly service: IService;

  public loop: boolean = false;
  public abstract readonly type: string;
  public abstract readonly title: string;
  public abstract readonly trackID: string;
  public abstract readonly playlistID?: string;

  constructor(service: IService, data: SongData) {
    this.service = service;

    this.title = data.title;
    this.playlistID = data.playlistID;
    this.trackID = data.trackID;
  }

  public toggleLoop() {
    return this.loop = !this.loop;
  }

  public abstract next(): Promise<Song | null>;
  public abstract stream(): Promise<ReadableStream> | ReadableStream;
}
