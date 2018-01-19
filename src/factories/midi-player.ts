import { Inject, Injectable } from '@angular/core';
import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker';
import { MidiFileSlicerFactory } from '../factories/midi-file-slicer';
import { IMidiOutput, IMidiPlayerFactoryOptions, IMidiPlayerOptions } from '../interfaces';
import { MidiMessageEncoder } from '../midi-message-encoder';
import { Scheduler } from '../scheduler';

export class MidiPlayer {

    private _endedTracks: null | number;

    private _json: IMidiFile;

    private _midiFileSlicer: MidiFileSlicer;

    private _midiMessageEncoder: MidiMessageEncoder;

    private _midiOutput: IMidiOutput;

    private _offset: null | number;

    private _resolve: null | (() => void);

    private _scheduler: Scheduler;

    private _schedulerSubscription: null | { unsubscribe (): void };

    constructor ({ json, midiFileSlicerFactory, midiMessageEncoder, midiOutput, scheduler }: IMidiPlayerOptions) {
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = midiFileSlicerFactory.create({ json });
        this._midiMessageEncoder = midiMessageEncoder;
        this._midiOutput = midiOutput;
        this._offset = null;
        this._scheduler = scheduler;
        this._schedulerSubscription = null;
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
                    complete: () => {}, // tslint:disable-line:no-empty
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

    private _schedule (start: number, end: number) {
        if (this._endedTracks === null || this._offset === null || this._resolve === null) {
            throw new Error(); // @todo
        }

        const events = this._midiFileSlicer.slice(start - this._offset, end - this._offset);

        events
            .filter(({ event }) => MidiPlayer._isSendableEvent(event))
            .forEach(({ event, time }) => this._midiOutput.send(this._midiMessageEncoder.encode(event), start + time));

        const endedTracks = events.filter(({ event }) => MidiPlayer._isEndOfTrack(event)).length;

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

    private static _isEndOfTrack (event: TMidiEvent) {
        return ('endOfTrack' in event);
    }

    private static _isSendableEvent (event: TMidiEvent) {
        return (('controlChange' in event) ||
            ('noteOff' in event) ||
            ('noteOn' in event) ||
            ('programChange' in event));
    }

}

@Injectable()
export class MidiPlayerFactory {

    private _options: {

        midiFileSlicerFactory: MidiFileSlicerFactory;

        midiMessageEncoder: MidiMessageEncoder;

        scheduler: Scheduler;

    };

    constructor (
        @Inject(MidiFileSlicerFactory) midiFileSlicerFactory: MidiFileSlicerFactory,
        @Inject(MidiMessageEncoder) midiMessageEncoder: MidiMessageEncoder,
        @Inject(Scheduler) scheduler: Scheduler
    ) {
        this._options = { midiFileSlicerFactory, midiMessageEncoder, scheduler };
    }

    public create (options: IMidiPlayerFactoryOptions) {
        return new MidiPlayer({ ...this._options, ...options });
    }

}

export const MIDI_PLAYER_FACTORY_PROVIDER = { deps: [ MidiFileSlicerFactory, MidiMessageEncoder, Scheduler ], provide: MidiPlayerFactory };
