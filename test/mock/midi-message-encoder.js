'use strict';

var di = require('di'),
    MidiMessageEncoder = require('../../src/midi-message-encoder.js').MidiMessageEncoder,
    MidiMessageEncoderMock,
    sinon = require('sinon');

function injector () {

    if (MidiMessageEncoderMock === undefined) {

        MidiMessageEncoderMock = {
            encode: sinon.stub()
        };

    } else {

        MidiMessageEncoderMock.encode.reset();

    }

    return MidiMessageEncoderMock;
}

di.annotate(injector, new di.Provide(MidiMessageEncoder));

module.exports.MidiMessageEncoderMock = injector;
