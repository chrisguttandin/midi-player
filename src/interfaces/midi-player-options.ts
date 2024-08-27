import { MidiFileSlicer } from 'midi-file-slicer';
import { TMidiEvent } from 'midi-json-parser-worker';
import { createStartIntervalScheduler } from '../factories/start-interval-scheduler';
import { createStartTimeoutScheduler } from '../factories/start-timeout-scheduler';
import { IMidiPlayerFactoryOptions } from './midi-player-factory-options';

export interface IMidiPlayerOptions extends Required<IMidiPlayerFactoryOptions> {
    midiFileSlicer: MidiFileSlicer;

    startIntervalScheduler: ReturnType<typeof createStartIntervalScheduler>;

    startTimeoutScheduler: ReturnType<typeof createStartTimeoutScheduler>;

    encodeMidiMessage(event: TMidiEvent): Uint8Array;
}
