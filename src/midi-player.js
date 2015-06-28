'use strict';

var di = require('di'),
    EventEmitter = require('events').EventEmitter,
    MidiFileSlicerFactory = require('./midi-file-slicer-factory.js').MidiFileSlicerFactory,
    MidiMessageEncoder = require('./midi-message-encoder.js').MidiMessageEncoder,
    Scheduler = require('./scheduler.js').Scheduler;

function midiPlayerInjector (/*EventEmitter, */midiMessageEncoder, midiFileSlicerFactory, scheduler) {

    return class MidiPlayer extends EventEmitter {

        constructor (options) {
            var json = options.json;

            super();

            this._advancedListener = null;
            this._currentTime = 0;
            this._endedTracks = null;
            this._json = json;
            this._midiFileSlicer = midiFileSlicerFactory.create({
                json: json
            });
            this._midiOutput = options.midiOutput;
            this._offset = null;
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

            var currentTime = scheduler.currentTime;

            this._endedTracks = 0;
            this._offset = currentTime - this._currentTime;
            this._schedule(currentTime, scheduler.lookahead);

            this._advancedListener = ::this._schedule;
            scheduler.on('advanced', this._advancedListener);
        }

        _schedule (previousLookahead, currentLookahead) {
            var events = this._midiFileSlicer.slice(previousLookahead - this._offset, currentLookahead - this._offset);

            events
                .filter((event) => this._isSendableEvent(event))
                .forEach((event) => this._midiOutput.send(midiMessageEncoder.encode(event), previousLookahead + event.time));

            let endedTracks = events.filter(::this._isEndOfTrack).length;

            this._endedTracks += endedTracks;

            if (this._endedTracks === this._json.tracks.length) {
                scheduler.removeListener('advanced', this._advancedListener);

                this._advancedListener = null;
                this._endedTracks = null;

                this.emit('ended');
            }
        }

    };

}

di.annotate(midiPlayerInjector, new di.Inject(MidiMessageEncoder, MidiFileSlicerFactory, Scheduler));

module.exports.midiPlayerInjector = midiPlayerInjector;
