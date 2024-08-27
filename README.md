# midi-player

**A MIDI player which sends MIDI messages to connected devices.**

[![version](https://img.shields.io/npm/v/midi-player.svg?style=flat-square)](https://www.npmjs.com/package/midi-player)

This module provides a player which sends MIDI messages to connected devices. It schedules the messages with a look ahead of about 500 milliseconds. It does not directly rely on the [Web MIDI API](https://webaudio.github.io/web-midi-api/) but expects a [MIDIOutput](https://webaudio.github.io/web-midi-api/#midioutput-interface) to be passed as constructor argument. But theoretically that could be anything which implements the same interface.

## Usage

`midi-player` is published on [npm](https://www.npmjs.com/package/midi-player) and can be installed as usual.

```shell
npm install midi-player
```

The only exported function is a factory method to create new player instances.

```js
import { create } from 'midi-player';

// This is a JSON object which represents a MIDI file.
const json = {
    division: 480,
    format: 1,
    tracks: [
        { channel: 0, delta: 0, noteOn: { noteNumber: 36, velocity: 100 } },
        { channel: 0, delta: 240, noteOff: { noteNumber: 36, velocity: 64 } },
        { delta: 0, endOfTrack: true }
    ]
};

// This is a quick & dirty approach to grab the first known MIDI output.
const midiAccess = await navigator.requestMIDIAccess();
const midiOutput = Array.from(midiAccess.outputs)[0];

const midiPlayer = create({ json, midiOutput });
```

By default only control change, note off, note on and program change events will be sent. But it's possible to provide a custom filter function. The following player will only send note off and note on events.

```js
const midiPlayer = create({
    filterMidiMessage: (event) => 'noteOff' in event || 'noteOn' in event
    // ... other options as described above
});
```

If you want to play a binary MIDI file you can use the [midi-json-parser](https://github.com/chrisguttandin/midi-json-parser) package to transform it into a compatible JSON representation.

### position

The `position` is set to the current `position` in milliseconds.

```js
midiPlayer.position;
```

### state

The `state` property will either be set to `'paused'`, `'playing'`, or `'stopped'`.

```js
midiPlayer.state;
```

### play()

Calling `play()` will initiate the playback from the start.

```js
midiPlayer.play().then(() => {
    // All MIDI messages have been sent when the promise returned by play() resolves.
});
```

It can only be called when the `state` of the player is `'stopped'`.

### pause()

Calling `pause()` will pause the playback at the current `position`.

```js
midiPlayer.pause();
```

It can only be called when the `state` of the player is `'playing'`.

### resume()

Calling `resume()` will resume a previously paused playback at the current `position`.

```js
midiPlayer.resume().then(() => {
    // All MIDI messages have been sent when the promise returned by resume() resolves.
});
```

It can only be called when the `state` of the player is `'paused'`.

### stop()

Calling `stop()` will stop the player.

```js
midiPlayer.stop();
```

It can only be called when the `state` of the player is not `'stopped'`.

## Acknowledgement

Most of the features of this package have been originally developed by [@infojunkie](https://github.com/infojunkie) who maintains a midi-player fork ([infojunkie/midi-player](https://github.com/infojunkie/midi-player)) with even more functionality.
