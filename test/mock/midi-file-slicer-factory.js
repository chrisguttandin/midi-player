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
        /* eslint-disable indent */
        const midiFileSlicer = {
                  slice: stub()
              };
        /* eslint-enable indent */

        this._midiFileSlicers.push(midiFileSlicer);

        return midiFileSlicer;
    }

}
