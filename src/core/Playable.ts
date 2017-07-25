import Playlist from '../core/Playlist';

export default abstract class Playable extends Playlist {
  protected _playing: boolean = false;

  public abstract stop(reason?: string): void;
  public abstract start(...args: any[]): Promise<void> | void;
  public abstract pause(): void;
  public abstract resume(): void;
  public abstract destroy(): void;

  get playing() {
    return this._playing;
  }
}
