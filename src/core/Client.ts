import { IService } from '../interfaces/IService';
import Playable from './Playable';

export default class Client {
  public readonly playlists: Map<string, Playable> = new Map();
  public readonly services: IService[];

  constructor(services: IService[]) {
    this.services = services;
  }
}
