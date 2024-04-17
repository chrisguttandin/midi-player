import { MidiFileSlicer } from 'midi-file-slicer';
import { TMidiEvent } from 'midi-json-parser-worker';
import { createStartScheduler } from '../factories/start-scheduler';
import { IMidiPlayerFactoryOptions } from './midi-player-factory-options';

export interface IMidiPlayerOptions extends Required<IMidiPlayerFactoryOptions> {
    midiFileSlicer: MidiFileSlicer;

    startScheduler: ReturnType<typeof createStartScheduler>;

    encodeMidiMessage(event: TMidiEvent): Uint8Array;
}
