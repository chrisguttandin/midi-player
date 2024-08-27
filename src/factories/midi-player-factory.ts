import { encodeMidiMessage } from '../helpers/encode-midi-message';
import { MidiPlayer } from '../midi-player';
import { TMidiPlayerFactoryFactory } from '../types';

export const createMidiPlayerFactory: TMidiPlayerFactoryFactory = (createMidiFileSlicer, startIntervalScheduler, startTimeoutScheduler) => {
    return (options) => {
        const midiFileSlicer = createMidiFileSlicer(options.json);

        return new MidiPlayer({
            filterMidiMessage: (event) => 'channel' in event,
            ...options,
            encodeMidiMessage,
            midiFileSlicer,
            startIntervalScheduler,
            startTimeoutScheduler
        });
    };
};
