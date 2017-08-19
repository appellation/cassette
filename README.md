# Cassette
[![Build Status](https://travis-ci.org/appellation/cassette.svg?branch=master)](https://travis-ci.org/appellation/cassette)

An extensible playlist module designed to make playlist management easy and powerful.

## How to use

Assume `cassette` is imported like so:

```js
const cassette = require('cassette');
```

1. Create some services. Cassette ships with several, but you can always make your own by implementing `IService`.

```js
const ytService = new cassette.YouTubeService('your api key');
```

2. Create a client using your services.

```js
const client = new cassette.Client([ytService]);
```

3. Make playlists. At its most basic level, cassette ships with a fully functional playlist (that is the entire point of this module, after all).  However, actually transmitting audio from that playlist is very implementation-specific; as such, you're welcome to extend the cassette playlist to make your own fully operable playlist. Cassette currently ships with a provided operable playlist designed for operation with Discord.js.

```js
class PlayablePlaylist extends cassette.Playlist {
  start() {
    (await this.current.stream()).pipe(out);
  }
}
```

4. Store playlists. The client has a `playlists` property which will stay empty unless you manually fill it from your playlist extension. You can do this however you want, but the basic idea is that you store the playlist on creation and remove it once the playlist is destroyed.

## Reference

### Playlist *extends `Array`*

- **`constructor(client: Client)`**

- **loop**: `boolean` whether to loop the playlist at extremeties
- **autoplay**: `boolean` whether to use the last song to find the next song when at the end of the playlist
- **pos**: `number` *(readonly)* the current 0-based position of the playlist
- **current**: `Song?` *(readonly)* the current

- **reset()**: `void` reset the playlist's songs and position
- **hasPrev()**: `boolean` whether the playlist is not at the first position
- **prev()**: `boolean` advance the playlist backwards and return whether it was successful
- **hasNext()**: `boolean` whether the playlist is not at the last position
- **next()**: `Promise<boolean>` advance the playlist and return whether it was successful
- **shuffle()**: `void` shuffle the playlist
- **add(content: string, options: { position?: number, searchType?: 'song' | 'playlist' })**: `Promise<Song[]>` add content to the playlist using client services

### DiscordPlaylist *extends `Playlist`*

- *static* **get(client: Client, guild: Guild)**: `DiscordPlaylist` get or make a playlist for a guild. `client` is the cassette client, not the discord.js client.
- *static* **ensureVoiceConnection(channel: VoiceChannel)**: `Promise<VoiceConnection>` ensure a voice connection.

- **`constructor(client: Client, guild: Guild)`**

- **guild**: `Guild` *(readonly)* the guild for this playlist
- **playing**: `boolean` *(readonly)* whether the playlist is currently playing

- **stop()**: `void` temporarily stop the playlist without destroying it
- **destroy()**: `void` stop the playlist and destroy it
- **pause()**: `void` pause playlist playback
- **resume()**: `void` resume playlist playback
- **start(channel: VoiceChannel)**: `Promise<void>` start playback in a channel

#### example
```js
// some command
const { DiscordPlaylist } = require('cassette');
const playlist = DiscordPlaylist.get(cassetteClient, message.guild);

await playlist.add(message.content);
return playlist.start(message.member.voiceChannel);
```
