import { encodeMidiMessage } from '../helpers/encode-midi-message';
import { MidiPlayer } from '../midi-player';
import { TMidiPlayerFactoryFactory } from '../types';

export const createMidiPlayerFactory: TMidiPlayerFactoryFactory = (createMidiFileSlicer, scheduler) => {
    return (options) => {
        const midiFileSlicer = createMidiFileSlicer(options.json);

        return new MidiPlayer({
            filterMidiMessage: (event) => 'controlChange' in event || 'noteOff' in event || 'noteOn' in event || 'programChange' in event,
            ...options,
            encodeMidiMessage,
            midiFileSlicer,
            scheduler
        });
    };
};
