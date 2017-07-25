import { IPlayable } from '../interfaces/IPlayable';
import { IService } from '../interfaces/IService';

export default class Client {
  public readonly playlists: Map<string, IPlayable> = new Map();
  public readonly services: IService[];

  constructor(services: IService[]) {
    this.services = services;
  }
}
