import { IService } from '../interfaces/IService';
import Song from './Song';

export type SearchType = 'song' | 'playlist';

export default class Playlist extends Array<Song> {
  public loop: boolean = false;
  public autoplay: boolean = false;

  private _pos: number = 0;

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
    if (this.current && this.current.loop) return true;

    if (this.hasNext()) {
      this._pos += 1;
      return true;
    }

    if (this.loop) {
      this._pos = 0;
      return true;
    }

    if (this.autoplay) {
      const next = await this.current.next();
      if (next) {
        this.push(next);
        this._pos += 1;
        return true;
      }
    }

    return false;
  }

  public shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }

    return this;
  }

  public async add(content: string, services: IService[], {
    position = Infinity,
    searchType = 'song',
  }: { position?: number, searchType?: SearchType } = {}): Promise<Song[]> {
    const added: Song[] = [];

    for (const service of services) {
      const fetchable = service.fetchable(content);
      added.push(...(await service.fetch(fetchable, searchType)));
    }

    this.splice(position, 0, ...added);
    return added;
  }
}
