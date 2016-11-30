import { MidiFileSlicer } from 'midi-file-slicer';

export class MidiFileSlicerFactory {

    public create (options) {
        return new MidiFileSlicer(options);
    }

}
