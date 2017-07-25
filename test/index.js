require('dotenv').config({ path: './test/.env' });
const test = require('ava');
const discord = require('discord.js');

const playlists = require('../dist/index');

let client;
let playlist;
let services;

test.serial('create services', t => {
  services = [new playlists.YouTubeService(process.env.GOOGLE_API_KEY)];
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

test.serial('add to playlist', async t => {
  await playlist.add('https://www.youtube.com/watch?v=OVMuwa-HRCQ https://www.youtube.com/watch?v=MwSkC85TDgY');
  return t.is(2, playlist.length);
});

test('shuffles', t => {
  if (playlist.songs.length < 2) return t.pass();

  const before = playlist.songs.slice();
  playlist.shuffle();
  return t.not(before, playlist.songs);
});
