import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker';
import { IMidiOutput, IMidiPlayer, IMidiPlayerOptions } from './interfaces';
import { Scheduler } from './scheduler';

export class MidiPlayer implements IMidiPlayer {

    private _encodeMidiMessage: (event: TMidiEvent) => Uint8Array;

    private _endedTracks: null | number;

    private _json: IMidiFile;

    private _midiFileSlicer: MidiFileSlicer;

    private _midiOutput: IMidiOutput;

    private _offset: null | number;

    private _resolve: null | (() => void);

    private _scheduler: Scheduler;

    private _schedulerSubscription: null | { unsubscribe (): void };

    constructor ({ encodeMidiMessage, json, midiFileSlicer, midiOutput, scheduler }: IMidiPlayerOptions) {
        this._encodeMidiMessage = encodeMidiMessage;
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = midiFileSlicer;
        this._midiOutput = midiOutput;
        this._offset = null;
        this._resolve = null;
        this._scheduler = scheduler;
        this._schedulerSubscription = null;
    }

    public play (): Promise<void> {
        if (this._schedulerSubscription !== null || this._endedTracks !== null) {
            throw new Error('The player is currently playing.');
        }

        this._endedTracks = 0;

        return new Promise<void>((resolve, reject) => {
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

    private _schedule (start: number, end: number): void {
        if (this._endedTracks === null || this._offset === null || this._resolve === null) {
            throw new Error(); // @todo
        }

        const events = this._midiFileSlicer.slice(start - this._offset, end - this._offset);

        events
            .filter(({ event }) => MidiPlayer._isSendableEvent(event))
            .forEach(({ event, time }) => this._midiOutput.send(this._encodeMidiMessage(event), start + time));

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

    private static _isEndOfTrack (event: TMidiEvent): boolean {
        return ('endOfTrack' in event);
    }

    private static _isSendableEvent (event: TMidiEvent): boolean {
        return (('controlChange' in event) ||
            ('noteOff' in event) ||
            ('noteOn' in event) ||
            ('programChange' in event));
    }

}
