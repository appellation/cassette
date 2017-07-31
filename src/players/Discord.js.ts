import { Guild, GuildMember, StreamDispatcher, VoiceConnection } from 'discord.js';

import Client from '../core/Client';
import Playable from '../core/Playable';
import Song from '../core/Song';

export type StopReason = 'temp' | 'terminal';

export default class DiscordPlaylist extends Playable {
  public static get(client: Client, guild: Guild) {
    const existing = client.playlists.get(guild.id);
    if (existing) return existing;

    const pl = new DiscordPlaylist(client, guild);
    client.playlists.set(guild.id, pl);
    return pl;
  }

  public static ensureVoiceConnection(member: GuildMember): Promise<VoiceConnection> {
    if (member.guild.voiceConnection) return Promise.resolve(member.guild.voiceConnection);

    const channel = member.voiceChannel;
    if (!channel) throw new Error('You\'re not in a voice channel.');
    if (!channel.joinable) throw new Error('I can\'t join your voice channel.');
    if (!channel.speakable) throw new Error('I can\'t speak in your voice channel.');
    return channel.join();
  }

  public readonly guild: Guild;

  constructor(client: Client, guild: Guild) {
    super(client);
    this.guild = guild;
  }

  get dispatcher() {
    return this.guild.voiceConnection ? this.guild.voiceConnection.dispatcher : null;
  }

  public stop(reason: StopReason = 'temp') {
    if (this.dispatcher) {
      this.dispatcher.end(reason);
      this.emit('stop', reason);
    }
  }

  public destroy() {
    this.stop('terminal');
  }

  public pause() {
    if (this.dispatcher) {
      this.dispatcher.pause();
      this.emit('pause');
    }
  }

  public resume() {
    if (this.dispatcher) {
      this.dispatcher.resume();
      this.emit('resume');
    }
  }

  public async start(member: GuildMember) {
    await DiscordPlaylist.ensureVoiceConnection(member);
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

    dispatcher.once('end', async (reason: StopReason) => {
      this._playing = false;

      if (reason === 'temp') return;
      if (reason === 'terminal') return this._destroy();

      const next = await this.next();
      if (!next) return this._destroy();

      await this._start();
    });
  }

  private _destroy() {
    if (this.guild.voiceConnection) this.guild.voiceConnection.disconnect();
    this.client.playlists.delete(this.guild.id);
  }
}
