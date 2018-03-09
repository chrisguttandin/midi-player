import { encodeMidiMessage } from '../helpers/encode-midi-message';
import { MidiPlayer } from '../midi-player';
import { TMidiPlayerFactoryFactory } from '../types';

export const createMidiPlayerFactory: TMidiPlayerFactoryFactory = (createMidiFileSlicer, scheduler) => {
    return (options) => {
        const midiFileSlicer = createMidiFileSlicer(options.json);

        return new MidiPlayer({ ...options, encodeMidiMessage, midiFileSlicer, scheduler });
    };
};
