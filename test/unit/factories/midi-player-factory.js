import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMidiPlayerFactory } from '../../../src/factories/midi-player-factory';

describe('createMidiPlayerFactory()', () => {
    let midiFileSlicerFactory;
    let midiPlayerFactory;

    beforeEach(() => {
        const scheduler = 'a fake scheduler';

        midiFileSlicerFactory = vi.fn();

        midiPlayerFactory = createMidiPlayerFactory(midiFileSlicerFactory, scheduler);
    });

    it('should return a factory function', () => {
        expect(midiPlayerFactory).to.be.a('function');
    });

    describe('midiPlayerFactory()', () => {
        it('should create a new midiFileSlicer', () => {
            const json = 'a fake midi representation';

            midiPlayerFactory({ json });

            expect(midiFileSlicerFactory).to.have.been.calledOnce;
            expect(midiFileSlicerFactory).to.have.been.calledWith(json);
        });
    });
});
