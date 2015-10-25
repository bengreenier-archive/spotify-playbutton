spotify-playbutton
=================

Expose the SDK behind the spotify play button widget to node

# How

Some scary shit. We EVAL the official spotify client with enough
shims to make it run. 

`npm install spotify-playbutton`. `require('spotify-playbutton')({SSL:true})`
will return a promise that resolves to a SpotifyRemote. See [API](#API).

# API

> SpotifyRemote is the __undocumented__ official spotify playbutton API.

## init(token, unknown, unkown, options)

We call this for you before we yield the promise.
It sets things up and connects to the local spotify client.

## playPauseCurrent

toggles play/pause

## pause

just pauses

## getCurrentTrack

gets the current track

## isClientRunning

is spotify desktop open?

## isTrackPlaying

is spotify playing a track?

## getCurrentURI

get the spotify:uri of the current track

## getIdentifier

returns `desktop-client`

## ??

There is more that I haven't played with yet. 
I find printing the initialized SpotifyRemote instance to the console to be the best way to find functionality.

# License

Who the fuck knows - my code is MIT but this might void some spotify TOS
or something. I wouldn't advise using it in code you want to keep owning.
