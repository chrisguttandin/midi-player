'use strict';

import { spy, stub } from 'sinon';

export class MidiFileSlicerFactoryMock {

    constructor () {
        this.create = spy(this.create);
        this._midiFileSlicers = [];
    }

    get midiFileSlicers () {
        return this._midiFileSlicers;
    }

    create () {
        const midiFileSlicer = {
                  slice: stub()
              };

        this._midiFileSlicers.push(midiFileSlicer);

        return midiFileSlicer;
    }

}
