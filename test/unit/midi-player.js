'use strict';

var di = require('di'),
    MidiFileSlicerFactoryMock = require('../mock/midi-file-slicer-factory.js').MidiFileSlicerFactoryMock,
    MidiMessageEncoderMock = require('../mock/midi-message-encoder.js').MidiMessageEncoderMock,
    midiPlayerInjector = require('../../src/midi-player.js').midiPlayerInjector,
    SchedulerMock = require('../mock/scheduler.js').SchedulerMock;

describe('MidiPlayer', function () {

    var midiFileSlicerFactory,
        midiMessageEncoder,
        midiPlayer,
        MidiPlayer,
        scheduler;

    beforeEach(function () {
        var injector = new di.Injector([
                MidiFileSlicerFactoryMock,
                MidiMessageEncoderMock,
                SchedulerMock
            ]);

        midiFileSlicerFactory = injector.get(MidiFileSlicerFactoryMock);
        midiMessageEncoder = injector.get(MidiMessageEncoderMock);
        MidiPlayer = injector.get(midiPlayerInjector);
        scheduler = injector.get(SchedulerMock);
    });

    describe('constructor', function () {

        it('should initialize the MidiFileSlicerFactory', function () {
            var json = 'a fake midi representation';

            midiPlayer = new MidiPlayer({
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

            midiPlayer = new MidiPlayer({
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
