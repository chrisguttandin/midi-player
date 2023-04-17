import { MidiFileSlicer } from 'midi-file-slicer';
import { TMidiEvent } from 'midi-json-parser-worker';
import { Scheduler } from '../scheduler';
import { IMidiPlayerFactoryOptions } from './midi-player-factory-options';

export interface IMidiPlayerOptions extends Required<IMidiPlayerFactoryOptions> {
    midiFileSlicer: MidiFileSlicer;

    scheduler: Scheduler;

    encodeMidiMessage(event: TMidiEvent): Uint8Array;
}
