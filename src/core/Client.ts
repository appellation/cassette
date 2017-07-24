import { IService } from '../interfaces/IService';
import Playlist from './Playlist';

export default class Client {
  public readonly playlists: Map<string, Playlist> = new Map();
  public readonly services: IService[];

  constructor(services: IService[]) {
    this.services = services;
  }
}
