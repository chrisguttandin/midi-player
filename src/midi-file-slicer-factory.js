import { MidiFileSlicer } from 'midi-file-slicer';

export class MidiFileSlicerFactory {

    create (options) { // eslint-disable-line class-methods-use-this
        return new MidiFileSlicer(options);
    }

}
