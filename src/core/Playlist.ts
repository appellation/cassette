import { IService } from '../interfaces/IService';
import Client from './Client';
import Song from './Song';

export type SearchType = 'song' | 'playlist';

export const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

export default class Playlist extends Array<Song> {
  public client: Client;

  public loop: boolean = false;
  public autoplay: boolean = false;

  private _pos: number = 0;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  get pos(): number {
    return this._pos;
  }

  get current(): Song {
    return this[this._pos];
  }

  public reset(): void {
    this.splice(0, this.length);
    this._pos = 0;
  }

  public hasPrev(): boolean {
    return this._pos > 0;
  }

  public prev(): boolean {
    if (this.hasPrev()) {
      this._pos -= 1;
      return true;
    }

    if (this.loop) {
      this._pos = this.length - 1;
      return true;
    }

    return false;
  }

  public hasNext(): boolean {
    return this._pos < this.length - 1;
  }

  public async next(): Promise<boolean> {
    const complete = () => true;

    if (this.current && this.current.loop) return complete();

    if (this.hasNext()) {
      this._pos += 1;
      return complete();
    }

    if (this.loop) {
      this._pos = 0;
      return complete();
    }

    if (this.autoplay) {
      const next = await this.current.next();
      if (next) {
        this.push(next);
        this._pos += 1;
        return complete();
      }
    }

    return false;
  }

  public shuffle(): void {
    shuffle(this);
    this._pos = 0;
  }

  public async add(content: string, {
    position = Infinity,
    searchType = 'song',
  }: { position?: number, searchType?: SearchType } = {}): Promise<Song[]> {
    const added: Song[] = [];

    for (const service of this.client.services) {
      const fetchable = service.fetchable(content);
      added.push(...(await service.fetch(fetchable, searchType)));
    }

    this.splice(position, 0, ...added);
    return added;
  }
}
