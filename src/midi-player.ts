import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker';
import { IMidiOutput, IMidiPlayer, IMidiPlayerOptions } from './interfaces';
import { PlayerState } from './types/player-state';
import { Scheduler } from './scheduler';

export class MidiPlayer implements IMidiPlayer {
    private _encodeMidiMessage: (event: TMidiEvent) => Uint8Array;

    private _endedTracks: null | number;

    private _json: IMidiFile;

    private _midiFileSlicer: MidiFileSlicer;

    private _midiOutput: IMidiOutput;

    private _offset: null | number;

    private _paused: null | number;

    private _resolve: null | (() => void);

    private _scheduler: Scheduler;

    private _schedulerSubscription: null | { unsubscribe(): void };

    private _performance: Window['performance'];

    constructor({ encodeMidiMessage, json, midiFileSlicer, midiOutput, scheduler }: IMidiPlayerOptions) {
        this._encodeMidiMessage = encodeMidiMessage;
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = midiFileSlicer;
        this._midiOutput = midiOutput;
        this._offset = null;
        this._paused = null;
        this._resolve = null;
        this._scheduler = scheduler;
        this._schedulerSubscription = null;
        this._performance = performance;
    }

    public play(): Promise<void> {
        if (this.state === PlayerState.Playing) {
            throw new Error('The player is currently playing.');
        }

        this._endedTracks = 0;

        return this._promise();
    }

    public pause(): void {
        if (this.state !== PlayerState.Playing) {
            throw new Error('The player is not currently playing.');
        }

        this._pause();

        this._paused = this._performance.now();
    }

    public resume(): Promise<void> {
        if (this.state !== PlayerState.Paused) {
            throw new Error('The player is not currently paused.');
        }

        this._offset! += this._performance.now() - this._paused!;

        return this._promise();
    }

    public stop(): void {
        this._pause();

        this._offset = null;

        this._endedTracks = null;
    }

    public get state(): PlayerState {
        if (this._schedulerSubscription === null && this._resolve === null) {
            return this._endedTracks === null ? PlayerState.Stopped : PlayerState.Paused;
        }
        return PlayerState.Playing;
    }

    private _pause(): void {
        if (this._resolve !== null) {
            this._resolve();
            this._resolve = null;
        }

        if (this._schedulerSubscription !== null) {
            this._schedulerSubscription.unsubscribe();
            this._schedulerSubscription = null;
        }

        if (this._midiOutput && this._midiOutput.clear) {
            this._midiOutput.clear();
        }
    }

    private _promise(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._schedulerSubscription = this._scheduler.subscribe({
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

    private _schedule(start: number, end: number): void {
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

    private static _isEndOfTrack(event: TMidiEvent): boolean {
        return 'endOfTrack' in event;
    }

    private static _isSendableEvent(event: TMidiEvent): boolean {
        return 'controlChange' in event || 'noteOff' in event || 'noteOn' in event || 'programChange' in event;
    }
}
