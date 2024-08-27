import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile, TMidiEvent } from 'midi-json-parser-worker';
import { createStartIntervalScheduler } from './factories/start-interval-scheduler';
import { createStartTimeoutScheduler } from './factories/start-timeout-scheduler';
import { IMidiOutput, IMidiPlayer, IMidiPlayerOptions } from './interfaces';
import { TState } from './types';

const ALL_SOUND_OFF_EVENT_DATA = Array.from({ length: 16 }, (_, index) => new Uint8Array([176 + index, 120, 0]));

export class MidiPlayer implements IMidiPlayer {
    private _encodeMidiMessage: (event: TMidiEvent) => Uint8Array;

    private _filterMidiMessage: (event: TMidiEvent) => boolean;

    private _json: IMidiFile;

    private _midiFileSlicer: MidiFileSlicer;

    private _midiOutput: IMidiOutput;

    private _startIntervalScheduler: ReturnType<typeof createStartIntervalScheduler>;

    private _startTimeoutScheduler: ReturnType<typeof createStartTimeoutScheduler>;

    private _state: null | TState;

    constructor({
        encodeMidiMessage,
        filterMidiMessage,
        json,
        midiFileSlicer,
        midiOutput,
        startIntervalScheduler,
        startTimeoutScheduler
    }: IMidiPlayerOptions) {
        this._encodeMidiMessage = encodeMidiMessage;
        this._filterMidiMessage = filterMidiMessage;
        this._json = json;
        this._midiFileSlicer = midiFileSlicer;
        this._midiOutput = midiOutput;
        this._startIntervalScheduler = startIntervalScheduler;
        this._startTimeoutScheduler = startTimeoutScheduler;
        this._state = null;
    }

    public get position(): null | number {
        return this._state === null ? 0 : this._state.offset + (this._state.peekScheduler?.() ?? 0);
    }

    public get state(): 'paused' | 'playing' | 'stopped' {
        return this._state === null ? 'stopped' : this._state.peekScheduler === null ? 'paused' : 'playing';
    }

    public pause(): void {
        if (this._state === null || this._state.peekScheduler === null) {
            throw new Error('The player is not playing.');
        }

        this._clear();

        const { resolve, peekScheduler, stopScheduler } = this._state;

        this._state = { ...this._state, offset: peekScheduler(), peekScheduler: null, stopScheduler: null };

        stopScheduler();
        resolve();
    }

    public play(): Promise<void> {
        if (this._state !== null) {
            throw new Error('The player is not stopped.');
        }

        return this._schedule(0, 0);
    }

    public resume(): Promise<void> {
        if (this._state === null || this._state.peekScheduler !== null) {
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
            const [peekScheduler, stopScheduler] = this._startIntervalScheduler(({ end, start }) => {
                if (this._state === null) {
                    this._state = { endedTracks, offset: start - offset, resolve, peekScheduler: null, stopScheduler: null };
                }

                const events = this._midiFileSlicer.slice(start - this._state.offset, end - this._state.offset);

                events
                    .filter(({ event }) => this._filterMidiMessage(event))
                    .forEach(({ event, time }) => this._midiOutput.send(this._encodeMidiMessage(event), start + time));

                const endOfTrackEvents = events.filter(({ event }) => MidiPlayer._isEndOfTrack(event));

                this._state.endedTracks += endOfTrackEvents.length;

                if (this._state.endedTracks === this._json.tracks.length) {
                    const timeout =
                        start + Math.max(...endOfTrackEvents.map(({ time }) => time)) - (this._state.peekScheduler?.() ?? start);

                    if (timeout > 0) {
                        this._state.stopScheduler?.();

                        this._state = {
                            ...this._state,
                            stopScheduler: this._startTimeoutScheduler(() => {
                                this._state = null;

                                resolve();
                            }, timeout)
                        };
                    } else {
                        this._stop(this._state);
                    }
                }
            });

            if (this._state?.stopScheduler === null) {
                this._state = { ...this._state, peekScheduler, stopScheduler };
            } else {
                stopScheduler();

                if (this._state !== null) {
                    this._state = { ...this._state, peekScheduler };
                }
            }
        });
    }

    private _stop({ resolve, stopScheduler }: TState): void {
        this._state = null;

        stopScheduler?.();
        resolve();
    }

    private static _isEndOfTrack(event: TMidiEvent): boolean {
        return 'endOfTrack' in event;
    }
}
