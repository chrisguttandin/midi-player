'use strict';

var di = require('di'),
    MidiFileSlicer = require('midi-file-slicer').MidiFileSlicer;

class MidiFileSlicerFactory {

    create (options) {
        return new MidiFileSlicer(options);
    }

}

di.annotate(MidiFileSlicerFactory);

module.exports.MidiFileSlicerFactory = MidiFileSlicerFactory;
