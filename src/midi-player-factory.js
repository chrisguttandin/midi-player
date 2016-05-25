'use strict';

import { EventEmitter } from 'events';
import { Inject } from '@angular/core/src/di/decorators';
import { MidiFileSlicerFactory } from './midi-file-slicer-factory';
import { MidiMessageEncoder } from './midi-message-encoder';
import { Scheduler } from './scheduler';

class MidiPlayer extends EventEmitter {

    constructor (options) {
        var json = options.json;

        super();

        this._advancedListener = null;
        this._currentTime = 0;
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = options.midiFileSlicerFactory.create({
            json: json
        });
        this._midiMessageEncoder = options.midiMessageEncoder;
        this._midiOutput = options.midiOutput;
        this._offset = null;
        this._scheduler = options.scheduler;
    }

    _isEndOfTrack (event) {
        return ('endOfTrack' in event);
    }

    _isSendableEvent (event) {
        return (('controllerChange' in event) ||
            ('noteOff' in event) ||
            ('noteOn' in event) ||
            ('programChange' in event));
    }

    play () {
        if (this._advancedListener !== null || this._endedTracks !== null) {
            throw new Error('The player is currently playing.');
        }

        var currentTime = this._scheduler.currentTime;

        this._endedTracks = 0;
        this._offset = currentTime - this._currentTime;
        this._advancedListener = ::this._schedule;

        this._scheduler.on('advanced', this._advancedListener);

        this._schedule(currentTime, this._scheduler.lookahead);
    }

    _schedule (previousLookahead, currentLookahead) {
        var events = this._midiFileSlicer.slice(previousLookahead - this._offset, currentLookahead - this._offset);

        events
            .filter((event) => this._isSendableEvent(event))
            .forEach((event) => this._midiOutput.send(this._midiMessageEncoder.encode(event), previousLookahead + event.time));

        let endedTracks = events.filter(::this._isEndOfTrack).length;

        this._endedTracks += endedTracks;

        if (this._endedTracks === this._json.tracks.length) {
            this._scheduler.removeListener('advanced', this._advancedListener);

            this._advancedListener = null;
            this._endedTracks = null;

            this.emit('ended');
        }
    }

}

export class MidiPlayerFactory {

    constructor (midiMessageEncoder, midiFileSlicerFactory, scheduler) {
        this._midiMessageEncoder = midiMessageEncoder;
        this._midiFileSlicerFactory = midiFileSlicerFactory;
        this._scheduler = scheduler;
    }

    create (options) {
        options.midiMessageEncoder = this._midiMessageEncoder;
        options.midiFileSlicerFactory = this._midiFileSlicerFactory;
        options.scheduler = this._scheduler;

        return new MidiPlayer(options);
    }

}

MidiPlayerFactory.parameters = [ [ new Inject(MidiMessageEncoder) ], [ new Inject(MidiFileSlicerFactory) ], [ new Inject(Scheduler) ] ];
