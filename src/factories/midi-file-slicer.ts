import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile } from 'midi-json-parser-worker';

export class MidiFileSlicerFactory {

    public create (options: { json: IMidiFile }) {
        return new MidiFileSlicer(options);
    }

}

export const MIDI_FILE_SLICER_FACTORY_PROVIDER = { deps: [], provide: MidiFileSlicerFactory };
