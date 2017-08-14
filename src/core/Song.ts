import { Readable as ReadableStream } from 'stream';
import { IService } from '../interfaces/IService';

export default abstract class Song {
  public readonly service: IService;

  public loop: boolean = false;
  public abstract readonly type: string;
  public abstract readonly title: string;
  public abstract readonly trackID: string | number;
  public abstract readonly playlistID?: string | number;
  public abstract readonly streamURL: string;

  constructor(service: IService) {
    this.service = service;
  }

  public toggleLoop(): boolean {
    return this.loop = !this.loop;
  }

  public abstract next(): Promise<Song | null>;
  public abstract stream(): Promise<ReadableStream> | ReadableStream;
}
