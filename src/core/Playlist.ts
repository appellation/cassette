import * as EventEmitter from 'events';
import { knuthShuffle } from 'knuth-shuffle';

import { IService } from '../interfaces/IService';
import Client from './Client';
import Song from './Song';

export type SearchType = 'song' | 'playlist';

export default class Playlist extends EventEmitter {
  public client: Client;

  public songs: Song[] = [];
  public loop: boolean = false;
  public autoplay: boolean = false;

  private _pos: number = 0;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  get length() {
    return this.songs.length;
  }

  get pos() {
    return this._pos;
  }

  get current() {
    return this.songs[this._pos];
  }

  public reset() {
    this.songs = [];
    this._pos = 0;
    this.emit('reset');
  }

  public hasPrev() {
    return this._pos > 0;
  }

  public prev() {
    if (this.hasPrev()) {
      this._pos -= 1;
      this.emit('prev');
      return true;
    }

    if (this.loop) {
      this._pos = this.songs.length - 1;
      this.emit('prev');
      return true;
    }

    return false;
  }

  public hasNext() {
    return this._pos < this.songs.length - 1;
  }

  public async next() {
    const complete = () => {
      this.emit('next');
      return true;
    };

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
        this.songs.push(next);
        this._pos += 1;
        return complete();
      }
    }

    return false;
  }

  public shuffle() {
    this.songs = knuthShuffle(this.songs);
    this._pos = 0;
    this.emit('shuffle');
  }

  public async add(content: string, {
    position = Infinity,
    searchType = 'song',
  }: { position?: number, searchType?: SearchType } = {}) {
    const added: Song[] = [];

    for (const service of this.client.services) {
      const fetchable = service.fetchable(content);
      added.push(...(await service.fetch(fetchable, searchType)));
    }

    this.songs.splice(position, 0, ...added);
    this.emit('add', added);
    return added;
  }
}
