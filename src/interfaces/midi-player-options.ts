import { MidiFileSlicer } from 'midi-file-slicer';
import { TMidiEvent } from 'midi-json-parser-worker';
import { createStartScheduler } from '../factories/start-scheduler';
import { createStartTimeoutScheduler } from '../factories/start-timeout-scheduler';
import { IMidiPlayerFactoryOptions } from './midi-player-factory-options';

export interface IMidiPlayerOptions extends Required<IMidiPlayerFactoryOptions> {
    midiFileSlicer: MidiFileSlicer;

    startScheduler: ReturnType<typeof createStartScheduler>;

    startTimeoutScheduler: ReturnType<typeof createStartTimeoutScheduler>;

    encodeMidiMessage(event: TMidiEvent): Uint8Array;
}
