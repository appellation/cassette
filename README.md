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

### Song
- **`constructor(service: IService)`**

- **service**: `IService` *(readonly)* the service that loaded this song
- **type**: `string` *(abstract, readonly)* the type of the song, based on the service
- **title**: `string` *(abstract, readonly)* the title of the song
- **trackID**: `string | number` *(abstract, readonly)* the ID of the song, relative to the service
- **playlistID?**: `string | number` *(abstract, readonly)* the ID of the playlist this song came from, if any, relative to the service
- **streamURL**: `string` *(abstract, readonly)* the URL to stream audio from
