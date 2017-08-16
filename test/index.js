require('dotenv').config({ path: './test/.env' });
const test = require('ava');
const discord = require('discord.js');

const playlists = require('../dist/index');

let client;
let playlist;
let services;

test.serial('create services', t => {
  services = [
    new playlists.YouTubeService(process.env.GOOGLE_API_KEY),
    // new playlists.SoundcloudService(process.env.SOUNDCLOUD_API_KEY)
  ];
  return t.pass();
});

test.serial('create client', t => {
  client = new playlists.Client(services);
  return t.pass();
});

test.serial('create playlist', t => {
  playlist = new playlists.Playlist(client);
  return t.pass();
});

test.serial('add to playlist', t => {
  // https://soundcloud.com/tom-stetson-905539972/sets/the-chill-pill
  return playlist.add('https://www.youtube.com/watch?v=OVMuwa-HRCQ https://www.youtube.com/watch?v=MwSkC85TDgY https://www.youtube.com/playlist?list=PLF5C76212C58C464A')
    .then(() => t.true(playlist.length > 100));
});

test.serial('shuffles', t => {
  if (playlist.songs.length < 2) return t.pass();

  const before = playlist.songs.slice();
  playlist.shuffle();
  return t.not(before, playlist.songs);
});

test.serial('advances', t => {
  const before = playlist.pos;
  const song = playlist.current;

  return playlist.next().then(r => {
    t.true(r);
    t.deepEqual(playlist.songs[before], song);
    return t.is(before + 1, playlist.pos);
  });
});

test.serial('reverses', t => {
  const before = playlist.pos;
  const song = playlist.current;

  t.true(playlist.prev());
  t.deepEqual(playlist.songs[playlist.pos + 1], song);
  return t.is(before - 1, playlist.pos);
});

test.serial('resets', t => {
  playlist.reset();
  t.is(0, playlist.songs.length);
  return t.is(0, playlist.pos);
});
