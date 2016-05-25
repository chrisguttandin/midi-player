'use strict';

import 'reflect-metadata';
import { MidiFileSlicerFactory } from '../../src/midi-file-slicer-factory';
import { MidiFileSlicerFactoryMock } from '../mock/midi-file-slicer-factory';
import { MidiMessageEncoder } from '../../src/midi-message-encoder';
import { MidiMessageEncoderMock } from '../mock/midi-message-encoder';
import { MidiPlayerFactory } from '../../src/midi-player-factory';
import { ReflectiveInjector } from '@angular/core';
import { Scheduler } from '../../src/scheduler';
import { SchedulerMock } from '../mock/scheduler';

describe('MidiPlayer', function () {

    var midiFileSlicerFactory,
        midiMessageEncoder,
        midiPlayer,
        midiPlayerFactory,
        scheduler;

    beforeEach(function () {
        var injector = ReflectiveInjector.resolveAndCreate([
                { provide: MidiFileSlicerFactory, useClass: MidiFileSlicerFactoryMock },
                { provide: MidiMessageEncoder, useClass: MidiMessageEncoderMock },
                MidiPlayerFactory,
                { provide: Scheduler, useClass: SchedulerMock }
            ]);

        midiFileSlicerFactory = injector.get(MidiFileSlicerFactory);
        midiMessageEncoder = injector.get(MidiMessageEncoder);
        midiPlayerFactory = injector.get(MidiPlayerFactory);
        scheduler = injector.get(Scheduler);
    });

    describe('constructor', function () {

        it('should initialize the MidiFileSlicerFactory', function () {
            var json = 'a fake midi representation';

            midiPlayer = midiPlayerFactory.create({
                json: json
            });

            expect(midiFileSlicerFactory.create).to.have.been.calledOnce;
            expect(midiFileSlicerFactory.create).to.have.been.calledWithExactly({
                json: json
            });
        });

    });

    describe('play()', function () {

        var json,
            midiFileSlicer,
            midiOutput,
            sequence;

        beforeEach(function () {
            json = {
                tracks: [
                    'a fake track'
                ]
            };

            midiOutput = {
                send: sinon.stub()
            };

            midiPlayer = midiPlayerFactory.create({
                json: json,
                midiOutput: midiOutput
            });

            sequence = 'a fake sequence';

            midiMessageEncoder.encode.returns(sequence);

            scheduler.currentTime = 200;
            scheduler.lookahead = 1000;
        });

        it('should schedule all events up to the lookahead', function () {
            var event = {
                    noteOn: 'a fake note on event',
                    time: 500
                };

            midiFileSlicer = midiFileSlicerFactory.midiFileSlicers[0];
            midiFileSlicer.slice.returns([
                event
            ]);

            midiPlayer.play();

            expect(midiFileSlicer.slice).to.have.been.calledOnce;
            expect(midiFileSlicer.slice).to.have.been.calledWithExactly(0, 800);

            expect(midiMessageEncoder.encode).to.have.been.calledOnce;
            expect(midiMessageEncoder.encode).to.have.been.calledWithExactly(event);

            expect(midiOutput.send).to.have.been.calledOnce;
            expect(midiOutput.send).to.have.been.calledWithExactly(sequence, 700);
        });

        it('should handle files which are shorter than the lookahead', function () {
            var event = {
                    endOfTrack: true,
                    time: 500
                };

            midiFileSlicer = midiFileSlicerFactory.midiFileSlicers[0];
            midiFileSlicer.slice.returns([
                event
            ]);

            midiPlayer.play();

            expect(scheduler.on).to.have.been.calledOnce;
            expect(scheduler.removeListener).to.have.been.calledOnce;

            expect(scheduler.on).to.have.been.calledBefore(scheduler.removeListener);
        });

    });

});
