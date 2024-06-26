import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker';
import { createStartScheduler } from './factories/start-scheduler';
import { IMidiOutput, IMidiPlayer, IMidiPlayerOptions, IState } from './interfaces';

const ALL_SOUND_OFF_EVENT_DATA = Array.from({ length: 16 }, (_, index) => new Uint8Array([176 + index, 120, 0]));

export class MidiPlayer implements IMidiPlayer {
    private _encodeMidiMessage: (event: TMidiEvent) => Uint8Array;

    private _filterMidiMessage: (event: TMidiEvent) => boolean;

    private _json: IMidiFile;

    private _midiFileSlicer: MidiFileSlicer;

    private _midiOutput: IMidiOutput;

    private _startScheduler: ReturnType<typeof createStartScheduler>;

    private _state: null | IState;

    constructor({ encodeMidiMessage, filterMidiMessage, json, midiFileSlicer, midiOutput, startScheduler }: IMidiPlayerOptions) {
        this._encodeMidiMessage = encodeMidiMessage;
        this._filterMidiMessage = filterMidiMessage;
        this._json = json;
        this._midiFileSlicer = midiFileSlicer;
        this._midiOutput = midiOutput;
        this._startScheduler = startScheduler;
        this._state = null;
    }

    public play(): Promise<void> {
        if (this._state !== null) {
            throw new Error('The player is currently playing.');
        }

        return new Promise((resolve) => {
            const stopScheduler = this._startScheduler(({ end, start }) => {
                if (this._state === null) {
                    this._state = { endedTracks: 0, offset: start, resolve, stopScheduler: null };
                }

                this._schedule(start, end, this._state);
            });

            if (this._state === null) {
                stopScheduler();
            } else {
                this._state.stopScheduler = stopScheduler;
            }
        });
    }

    public stop(): void {
        if (this._state === null) {
            throw new Error('The player is already stopped.');
        }

        // Bug #1: Chrome does not yet implement the clear() method.
        this._midiOutput.clear?.();
        ALL_SOUND_OFF_EVENT_DATA.forEach((data) => this._midiOutput.send(data));
        this._stop(this._state);
    }

    private _schedule(start: number, end: number, state: IState): void {
        const events = this._midiFileSlicer.slice(start - state.offset, end - state.offset);

        events
            .filter(({ event }) => this._filterMidiMessage(event))
            .forEach(({ event, time }) => this._midiOutput.send(this._encodeMidiMessage(event), start + time));

        const endedTracks = events.filter(({ event }) => MidiPlayer._isEndOfTrack(event)).length;

        state.endedTracks += endedTracks;

        if (state.endedTracks === this._json.tracks.length) {
            this._stop(state);
        }
    }

    private _stop(state: IState): void {
        const { resolve, stopScheduler } = state;

        stopScheduler?.();

        this._state = null;

        resolve();
    }

    private static _isEndOfTrack(event: TMidiEvent): boolean {
        return 'endOfTrack' in event;
    }
}
