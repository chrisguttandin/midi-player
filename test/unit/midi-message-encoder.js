import 'reflect-metadata';
import { MidiMessageEncoder } from '../../src/midi-message-encoder';
import { ReflectiveInjector } from '@angular/core';

describe('MidiMessageEncoder', function () {

    var midiMessageEncoder;

    beforeEach(function () {
        /* eslint-disable indent */
        var injector = ReflectiveInjector.resolveAndCreate([
                MidiMessageEncoder
            ]);
        /* eslint-enable indent */

        midiMessageEncoder = injector.get(MidiMessageEncoder);
    });

    describe('encode()', function () {

        it('should encode a controller change message', function () {
            /* eslint-disable indent */
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    controllerChange: {
                        type: 16,
                        value: 127
                    }
                });
            /* eslint-enable indent */

            expect(sequence).to.deep.equal([0xB3, 0x10, 0x7F]);
        });

        it('should encode a note off message', function () {
            /* eslint-disable indent */
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    noteOff: {
                        noteNumber: 71,
                        velocity: 127
                    }
                });
            /* eslint-enable indent */

            expect(sequence).to.deep.equal([0x83, 0x47, 0x7F]);
        });

        it('should encode a note on message', function () {
            /* eslint-disable indent */
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    noteOn: {
                        noteNumber: 71,
                        velocity: 127
                    }
                });
            /* eslint-enable indent */

            expect(sequence).to.deep.equal([0x93, 0x47, 0x7F]);
        });

        it('should encode a program change message', function () {
            /* eslint-disable indent */
            var sequence = midiMessageEncoder.encode({
                    channel: 3,
                    programChange: {
                        programNumber: 49
                    }
                });
            /* eslint-enable indent */

            expect(sequence).to.deep.equal([0xC3, 0x31]);
        });

    });

});
