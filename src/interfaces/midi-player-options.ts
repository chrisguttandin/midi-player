import { MidiFileSlicerFactory } from '../factories/midi-file-slicer';
import { MidiMessageEncoder } from '../midi-message-encoder';
import { Scheduler } from '../scheduler';
import { IMidiPlayerFactoryOptions } from './midi-player-factory-options';

export interface IMidiPlayerOptions extends IMidiPlayerFactoryOptions {

    midiFileSlicerFactory: MidiFileSlicerFactory;

    midiMessageEncoder: MidiMessageEncoder;

    scheduler: Scheduler;

}
