'use strict';

var di = require('di'),
    MidiFileSlicerFactory = require('../../src/midi-file-slicer-factory.js').MidiFileSlicerFactory,
    MidiFileSlicerFactoryMock,
    sinon = require('sinon');

function injector () {

    if (MidiFileSlicerFactoryMock === undefined) {

        MidiFileSlicerFactoryMock = {
            create: sinon.spy(function () {
                var midiFileSlicer = {
                        slice: sinon.stub()
                    };

                MidiFileSlicerFactoryMock.midiFileSlicers.push(midiFileSlicer);

                return midiFileSlicer;
            })
        };

    } else {

        MidiFileSlicerFactoryMock.create.reset();

    }

    MidiFileSlicerFactoryMock.midiFileSlicers = [];

    return MidiFileSlicerFactoryMock;
}

di.annotate(injector, new di.Provide(MidiFileSlicerFactory));

module.exports.MidiFileSlicerFactoryMock = injector;
