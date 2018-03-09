import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile } from 'midi-json-parser-worker';
import { encodeMidiMessage } from '../helpers/encode-midi-message';
import { IMidiPlayer, IMidiPlayerFactoryOptions } from '../interfaces';
import { MidiPlayer } from '../midi-player';
import { Scheduler } from '../scheduler';

export const createMidiPlayerFactory = (midiFileSlicerFactory: (json: IMidiFile) => MidiFileSlicer, scheduler: Scheduler) => {
    return (options: IMidiPlayerFactoryOptions): IMidiPlayer => {
        const midiFileSlicer = midiFileSlicerFactory(options.json);

        return new MidiPlayer({ ...options, encodeMidiMessage, midiFileSlicer, scheduler });
    };
};
