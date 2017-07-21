import { Client, Guild, StreamDispatcher } from 'discord.js';

import { IService } from '../interfaces/IService';
import Playlist from '../Playlist';
import Song from '../Song';

export type StopReason = 'temp' | 'terminal';

export default class DiscordPlaylist extends Playlist {
  public readonly client: Client;
  public readonly guild: Guild;

  constructor(guild: Guild, services: IService[]) {
    super(services);

    this.client = guild.client;
    this.guild = guild;
  }

  get dispatcher() {
    return this.guild.voiceConnection ? this.guild.voiceConnection.dispatcher : null;
  }

  public stop(reason: StopReason = 'temp') {
    if (this.dispatcher) this.dispatcher.end(reason);
  }

  public destroy() {
    this.stop('terminal');
  }

  public pause() {
    if (this.dispatcher) this.dispatcher.pause();
  }

  public resume() {
    if (this.dispatcher) this.dispatcher.resume();
  }

  private async _start() {
    if (!this.current) throw new Error('No song available to play.');
    if (!this.guild.voiceConnection) throw new Error('No voice connection to play audio on.');

    this.stop();
    const dispatcher = this.guild.voiceConnection.playStream(await this.current.stream());
    this.playing = true;

    dispatcher.once('end', async (reason: StopReason) => {
      this.playing = false;

      if (reason === 'temp') return;
      if (reason === 'terminal') return this._destroy();

      if (!this.current.loop) {
        const next = await this.next();
        if (!next) return this._destroy();
      }

      this._start();
    });
  }

  private _destroy() {
    if (this.guild.voiceConnection) this.guild.voiceConnection.disconnect();
  }
}
