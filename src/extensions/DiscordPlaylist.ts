import { Guild, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';

import Client from '../core/Client';
import Playlist from '../core/Playlist';
import Song from '../core/Song';

import Error, { Code } from './CassetteError';

export type EndReason = 'temp' | 'terminal';

export default class DiscordPlaylist extends Playlist {
  public static get(client: Client, guild: Guild): Playlist {
    const existing = client.playlists.get(guild.id);
    if (existing) return existing;

    const pl = new this(client, guild);
    client.playlists.set(guild.id, pl);
    return pl;
  }

  public static ensureVoiceConnection(channel: VoiceChannel): Promise<VoiceConnection> {
    if (channel.connection) return Promise.resolve(channel.connection);

    if (!channel) throw new Error(Code.NO_VOICE_CHANNEL);
    if (!channel.joinable) throw new Error(Code.NOT_JOINABLE);
    if (!channel.speakable) throw new Error(Code.NOT_SPEAKABLE);
    return channel.join();
  }

  public readonly guild: Guild;
  private _playing: boolean;

  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }

  private get _dispatcher(): StreamDispatcher | null {
    return this.guild.voiceConnection ? this.guild.voiceConnection.dispatcher : null;
  }

  get playing(): boolean {
    return this._playing;
  }

  public stop(): void {
    return this.end('temp');
  }

  public destroy(): void {
    return this.end('terminal');
  }

  public pause(): void {
    if (this._dispatcher) this._dispatcher.pause();
  }

  public resume(): void {
    if (this._dispatcher) this._dispatcher.resume();
  }

  public async start(channel: VoiceChannel): Promise<void> {
    await DiscordPlaylist.ensureVoiceConnection(channel);
    await this._start();
  }

  private async _start(): Promise<void> {
    if (!this.current) throw new Error(Code.NO_CURRENT_SONG);
    if (!this.guild.voiceConnection) throw new Error(Code.NO_VOICE_CONNECTION);

    this.stop();
    const dispatcher = this.guild.voiceConnection.playStream(await this.current.stream(), { volume: 0.2 });
    this._playing = true;

    dispatcher.once('end', async (reason: EndReason | 'user') => {
      this._playing = false;

      if (reason === 'temp') return;
      if (reason === 'terminal') return this._destroy();

      const next = await this.next();
      if (!next) return this._destroy();

      await this._start();
    });
  }

  private end(reason: EndReason = 'terminal'): void {
    if (this._dispatcher) this._dispatcher.end(reason);
  }

  private _destroy(): void {
    if (this.guild.voiceConnection) this.guild.voiceConnection.disconnect();
    this.client.playlists.delete(this.guild.id);
  }
}
