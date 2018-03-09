import { encodeMidiMessage } from '../../../src/helpers/encode-midi-message';

describe('encodeMidiMessage()', () => {

    it('should encode a control change message', () => {
        const sequence = encodeMidiMessage({
            channel: 3,
            controlChange: {
                type: 16,
                value: 127
            }
        });

        expect(sequence).to.deep.equal(new Uint8Array([ 0xB3, 0x10, 0x7F ]));
    });

    it('should encode a note off message', () => {
        const sequence = encodeMidiMessage({
            channel: 3,
            noteOff: {
                noteNumber: 71,
                velocity: 127
            }
        });

        expect(sequence).to.deep.equal(new Uint8Array([ 0x83, 0x47, 0x7F ]));
    });

    it('should encode a note on message', () => {
        const sequence = encodeMidiMessage({
            channel: 3,
            noteOn: {
                noteNumber: 71,
                velocity: 127
            }
        });

        expect(sequence).to.deep.equal(new Uint8Array([ 0x93, 0x47, 0x7F ]));
    });

    it('should encode a program change message', () => {
        const sequence = encodeMidiMessage({
            channel: 3,
            programChange: {
                programNumber: 49
            }
        });

        expect(sequence).to.deep.equal(new Uint8Array([ 0xC3, 0x31 ]));
    });

});
