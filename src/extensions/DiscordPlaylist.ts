import { Guild, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';

import Client from '../core/Client';
import Playlist from '../core/Playlist';
import Song from '../core/Song';

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

    if (!channel) throw new Error('You\'re not in a voice channel.');
    if (!channel.joinable) throw new Error('I can\'t join your voice channel.');
    if (!channel.speakable) throw new Error('I can\'t speak in your voice channel.');
    return channel.join();
  }

  public readonly guild: Guild;
  private _playing: boolean;

  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }

  private get _dispatcher() {
    return this.guild.voiceConnection ? this.guild.voiceConnection.dispatcher : null;
  }

  get playing() {
    return this._playing;
  }

  public stop() {
    return this.end('temp');
  }

  public destroy() {
    this.end('terminal');
  }

  public pause() {
    if (this._dispatcher) {
      this._dispatcher.pause();
      this.emit('pause');
    }
  }

  public resume() {
    if (this._dispatcher) {
      this._dispatcher.resume();
      this.emit('resume');
    }
  }

  public async start(channel: VoiceChannel) {
    await DiscordPlaylist.ensureVoiceConnection(channel);
    await this._start();
    this.emit('start');
  }

  private async _start() {
    if (!this.current) throw new Error('No song available to play.');
    if (!this.guild.voiceConnection) throw new Error('No voice connection to play audio on.');

    this.stop();
    const dispatcher = this.guild.voiceConnection.playStream(await this.current.stream(), { volume: 0.2 });
    this._playing = true;
    this.emit('playing');

    dispatcher.once('end', async (reason: EndReason | 'user') => {
      this._playing = false;

      if (reason === 'temp') return;
      if (reason === 'terminal') return this._destroy();

      const next = await this.next();
      if (!next) return this._destroy();

      await this._start();
    });
  }

  private end(reason: EndReason = 'terminal') {
    if (this._dispatcher) {
      this._dispatcher.end(reason);
      this.emit('end', reason);
    }
  }

  private _destroy() {
    if (this.guild.voiceConnection) this.guild.voiceConnection.disconnect();
    this.client.playlists.delete(this.guild.id);
  }
}
