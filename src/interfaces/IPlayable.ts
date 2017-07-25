import Playlist from '../core/Playlist';

export interface IPlayable extends Playlist {
  stop(reason?: string): void;
  start(...args: any[]): Promise<void> | void;
  pause(): void;
  resume(): void;
  destroy(): void;
}
