import 'core-js/es7/reflect';
import { MidiFileSlicerFactory } from '../../../src/factories/midi-file-slicer';
import { MidiFileSlicerFactoryMock } from '../../mock/midi-file-slicer-factory';
import { MidiMessageEncoder } from '../../../src/midi-message-encoder';
import { MidiMessageEncoderMock } from '../../mock/midi-message-encoder';
import { MidiPlayerFactory } from '../../../src/factories/midi-player';
import { ReflectiveInjector } from '@angular/core';
import { Scheduler } from '../../../src/scheduler';
import { WORKER_TIMERS_PROVIDER } from '../../../src/providers/worker-timers';
import { performance } from '../../../src/providers/performance';
import { performanceMock } from '../../mock/performance';
import { stub } from 'sinon';

describe('MidiPlayer', () => {

    let midiFileSlicerFactory;
    let midiMessageEncoder;
    let midiPlayer;
    let midiPlayerFactory;

    beforeEach(() => {
        const injector = ReflectiveInjector.resolveAndCreate([
            { provide: MidiFileSlicerFactory, useClass: MidiFileSlicerFactoryMock },
            { provide: MidiMessageEncoder, useClass: MidiMessageEncoderMock },
            MidiPlayerFactory,
            { provide: performance, useValue: performanceMock },
            Scheduler,
            WORKER_TIMERS_PROVIDER
        ]);

        midiFileSlicerFactory = injector.get(MidiFileSlicerFactory);
        midiMessageEncoder = injector.get(MidiMessageEncoder);
        midiPlayerFactory = injector.get(MidiPlayerFactory);
    });

    describe('constructor', () => {

        it('should initialize the MidiFileSlicerFactory', () => {
            const json = 'a fake midi representation';

            midiPlayer = midiPlayerFactory.create({ json });

            expect(midiFileSlicerFactory.create).to.have.been.calledOnce;
            expect(midiFileSlicerFactory.create).to.have.been.calledWithExactly({ json });
        });

    });

    describe('play()', () => {

        let json;
        let midiFileSlicer;
        let midiOutput;
        let sequence;

        beforeEach(() => {
            json = {
                tracks: [
                    'a fake track'
                ]
            };

            midiOutput = {
                send: stub()
            };

            midiPlayer = midiPlayerFactory.create({
                json,
                midiOutput
            });

            sequence = 'a fake sequence';

            midiMessageEncoder.encode.returns(sequence);

            performanceMock.now.reset();
            performanceMock.now.returns(200);
        });

        it('should schedule all events up to the lookahead', () => {
            const event = {
                noteOn: 'a fake note on event'
            };
            const time = 500;

            midiFileSlicer = midiFileSlicerFactory.midiFileSlicers[0];
            midiFileSlicer.slice.returns([ { event, time } ]);

            midiPlayer.play();

            expect(midiFileSlicer.slice).to.have.been.calledOnce;
            expect(midiFileSlicer.slice).to.have.been.calledWithExactly(0, 1000);

            expect(midiMessageEncoder.encode).to.have.been.calledOnce;
            expect(midiMessageEncoder.encode).to.have.been.calledWithExactly(event);

            expect(midiOutput.send).to.have.been.calledOnce;
            expect(midiOutput.send).to.have.been.calledWithExactly(sequence, 700);
        });

        it('should return a promise', () => {
            expect(midiPlayer.play()).to.be.a('promise');
        });

        it('should resolve the promise after playing the track', (done) => {
            midiFileSlicer = midiFileSlicerFactory.midiFileSlicers[0];
            midiFileSlicer.slice.returns([ { event: { delta: 0, endOfTrack: true } } ]);

            midiPlayer
                .play()
                .then(() => done());
        });

    });

});
