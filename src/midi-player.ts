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

    public pause(): void {
        if (this._state === null || this._state.stopScheduler === null) {
            throw new Error('The player is not playing.');
        }

        this._clear();

        const { resolve, stopScheduler } = this._state;

        this._state.offset = stopScheduler();
        this._state.stopScheduler = null;

        resolve();
    }

    public play(): Promise<void> {
        if (this._state !== null) {
            throw new Error('The player is not stopped.');
        }

        return this._schedule(0, 0);
    }

    public resume(): Promise<void> {
        if (this._state === null || this._state.stopScheduler !== null) {
            throw new Error('The player is not paused.');
        }

        const { endedTracks, offset } = this._state;

        this._state = null;

        return this._schedule(endedTracks, offset);
    }

    public stop(): void {
        if (this._state === null) {
            throw new Error('The player is already stopped.');
        }

        if (this._state.stopScheduler !== null) {
            this._clear();
            this._stop(this._state);
        }
    }

    private _clear(): void {
        // Bug #1: Chrome does not yet implement the clear() method.
        this._midiOutput.clear?.();
        ALL_SOUND_OFF_EVENT_DATA.forEach((data) => this._midiOutput.send(data));
    }

    private _schedule(endedTracks: number, offset: number): Promise<void> {
        return new Promise((resolve) => {
            const stopScheduler = this._startScheduler(({ end, start }) => {
                if (this._state === null) {
                    this._state = { endedTracks, offset: start - offset, resolve, stopScheduler: null };
                }

                const events = this._midiFileSlicer.slice(start - this._state.offset, end - this._state.offset);

                events
                    .filter(({ event }) => this._filterMidiMessage(event))
                    .forEach(({ event, time }) => this._midiOutput.send(this._encodeMidiMessage(event), start + time));

                this._state.endedTracks += events.filter(({ event }) => MidiPlayer._isEndOfTrack(event)).length;

                if (this._state.endedTracks === this._json.tracks.length) {
                    this._stop(this._state);
                }
            });

            if (this._state === null) {
                stopScheduler();
            } else {
                this._state.stopScheduler = stopScheduler;
            }
        });
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
