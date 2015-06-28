'use strict';

var di = require('di'),
    MidiMessageEncoder = require('../../src/midi-message-encoder.js').MidiMessageEncoder;

describe('midiMessageEncoder', function () {

    var midiMessageEncoder;

    beforeEach(function () {
        var injector = new di.Injector();

        midiMessageEncoder = injector.get(MidiMessageEncoder);
    });

    describe('encode()', function () {

        it('should encode a controller change message', function () {
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    controllerChange: {
                        type: 16,
                        value: 127
                    }
                });

            expect(sequence).to.deep.equal([0xB3, 0x10, 0x7F]);
        });

        it('should encode a note off message', function () {
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    noteOff: {
                        noteNumber: 71,
                        velocity: 127
                    }
                });

            expect(sequence).to.deep.equal([0x83, 0x47, 0x7F]);
        });

        it('should encode a note on message', function () {
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    noteOn: {
                        noteNumber: 71,
                        velocity: 127
                    }
                });

            expect(sequence).to.deep.equal([0x93, 0x47, 0x7F]);
        });

        it('should encode a program change message', function () {
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    programChange: {
                        programNumber: 49
                    }
                });

            expect(sequence).to.deep.equal([0xC3, 0x31]);
        });

    });

});
