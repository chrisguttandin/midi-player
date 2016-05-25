'use strict';

import { MidiFileSlicer } from 'midi-file-slicer';

export class MidiFileSlicerFactory {

    create (options) {
        return new MidiFileSlicer(options);
    }

}
