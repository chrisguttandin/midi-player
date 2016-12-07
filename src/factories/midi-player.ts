import { MidiFileSlicerFactory } from '../factories/midi-file-slicer';
import { MidiMessageEncoder } from '../midi-message-encoder';
import { performance } from '../providers/performance';
import { Scheduler } from '../scheduler';
import { Inject, Injectable } from '@angular/core';

export class MidiPlayer {

    private _currentTime: number;

    private _endedTracks: number;

    private _json;

    private _midiFileSlicer;

    private _midiMessageEncoder;

    private _midiOutput;

    private _offset: number;

    private _performance;

    private _resolve;

    private _scheduler;

    private _schedulerSubscription;

    constructor ({ json, midiFileSlicerFactory, midiMessageEncoder, midiOutput, performance, scheduler }) {
        this._currentTime = 0;
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = midiFileSlicerFactory.create({ json });
        this._midiMessageEncoder = midiMessageEncoder;
        this._midiOutput = midiOutput;
        this._offset = null;
        this._performance = performance;
        this._scheduler = scheduler;
        this._schedulerSubscription = null;
    }

    private static _isEndOfTrack (event) {
        return ('endOfTrack' in event);
    }

    private static _isSendableEvent (event) {
        return (('controlChange' in event) ||
            ('noteOff' in event) ||
            ('noteOn' in event) ||
            ('programChange' in event));
    }

    public play () {
        if (this._schedulerSubscription !== null || this._endedTracks !== null) {
            throw new Error('The player is currently playing.');
        }

        this._endedTracks = 0;

        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._schedulerSubscription = this._scheduler
                .subscribe({
                    error: (err) => reject(err),
                    next: ({ end, start }) => {
                        if (this._offset === null) {
                            this._offset = start;
                        }

                        this._schedule(start, end);
                    }
                });

            if (this._resolve === null) {
                this._schedulerSubscription.unsubscribe();
            }
        });
    }

    private _schedule (start, end) {
        const events = this._midiFileSlicer.slice(start - this._offset, end - this._offset);

        events
            .filter((event) => MidiPlayer._isSendableEvent(event))
            .forEach((event) => this._midiOutput.send(this._midiMessageEncoder.encode(event), start + event.time));

        const endedTracks = events.filter(MidiPlayer._isEndOfTrack).length;

        this._endedTracks += endedTracks;

        if (this._endedTracks === this._json.tracks.length) {
            if (this._schedulerSubscription !== null) {
                this._schedulerSubscription.unsubscribe();
            }

            this._schedulerSubscription = null;
            this._endedTracks = null;

            this._resolve();

            this._resolve = null;
        }
    }

}

@Injectable()
export class MidiPlayerFactory {

    private _options;

    constructor (
        @Inject(MidiFileSlicerFactory) midiFileSlicerFactory,
        @Inject(MidiMessageEncoder) midiMessageEncoder,
        @Inject(Scheduler) scheduler,
        @Inject(performance) performance,
    ) {
        this._options = { midiFileSlicerFactory, midiMessageEncoder, performance, scheduler };
    }

    public create (options) {
        return new MidiPlayer(Object.assign({}, this._options, options));
    }

}
