import { knuthShuffle } from 'knuth-shuffle';

import { IService } from './interfaces/IService';
import Song from './Song';

export default class Playlist {
  public services: IService[];
  public songs: Song[] = [];
  public loop: boolean = false;
  public autoplay: boolean = false;
  public playing: boolean = false;

  protected _pos: number = 0;

  constructor(services: IService[]) {
    this.services = services;
  }

  get length() {
    return this.songs.length;
  }

  get pos() {
    return this._pos + 1;
  }

  get current() {
    return this.songs[this._pos];
  }

  public reset() {
    this.songs = [];
    this._pos = 0;
  }

  public hasPrev() {
    return this._pos > 0;
  }

  public prev() {
    if (this.hasPrev()) {
      this._pos -= 1;
      return true;
    }

    if (this.loop) {
      this._pos = this.songs.length - 1;
      return true;
    }

    return false;
  }

  public hasNext() {
    return this._pos < this.songs.length - 1;
  }

  public async next() {
    if (this.hasNext()) {
      this._pos += 1;
      return true;
    }

    if (this.loop) {
      this._pos = 0;
      return true;
    }

    if (this.autoplay) {
      const next = await this.current.nextRecommended();
      if (next) {
        this.songs.push(next);
        this._pos += 1;
        return true;
      }
    }

    return false;
  }

  public shuffle() {
    this.songs = knuthShuffle(this.songs);
    this._pos = 0;
  }

  public async add(content: string, position = Infinity) {
    const added: Song[] = [];
    const words = content.split(' ');

    for (const service of this.services) {
      const fetchable = service.fetchable(content);
      added.push(...(await service.fetch(fetchable)));
    }

    this.songs.splice(position, 0, ...added);
    return added;
  }
}
