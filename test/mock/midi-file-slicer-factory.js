export class MidiFileSlicerFactoryMock {

    constructor () {
        this.create = sinon.spy(this.create); // eslint-disable-line no-undef
        this._midiFileSlicers = [];
    }

    get midiFileSlicers () {
        return this._midiFileSlicers;
    }

    create () {
        const midiFileSlicer = {
            slice: sinon.stub() // eslint-disable-line no-undef
        };

        this._midiFileSlicers.push(midiFileSlicer);

        return midiFileSlicer;
    }

}
