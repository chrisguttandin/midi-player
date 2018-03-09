import { clearInterval, setInterval } from 'worker-timers';
import { MidiPlayer } from '../../src/midi-player';
import { Scheduler } from '../../src/scheduler';
import { midiFileSlicerMock } from '../mock/midi-file-slicer';
import { midiOutputMock } from '../mock/midi-output';
import { performanceMock } from '../mock/performance';
import { stub } from 'sinon';

describe('MidiPlayer', () => {

    let encodeMidiMessage;
    let json;
    let midiPlayer;
    let scheduler;
    let sequence;

    beforeEach(() => {
        encodeMidiMessage = stub();

        json = {
            tracks: [
                'a fake track'
            ]
        };

        scheduler = new Scheduler(clearInterval, performanceMock, setInterval);

        midiPlayer = new MidiPlayer({
            encodeMidiMessage,
            json,
            midiFileSlicer: midiFileSlicerMock,
            midiOutput: midiOutputMock,
            scheduler
        });

        sequence = 'a fake sequence';

        encodeMidiMessage.returns(sequence);

        midiFileSlicerMock.slice.reset();

        midiOutputMock.send.reset();

        performanceMock.now.reset();
        performanceMock.now.returns(200);
    });

    describe('play()', () => {

        it('should schedule all events up to the lookahead', () => {
            const event = {
                noteOn: 'a fake note on event'
            };
            const time = 500;

            midiFileSlicerMock.slice.returns([ { event, time } ]);

            midiPlayer.play();

            expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
            expect(midiFileSlicerMock.slice).to.have.been.calledWithExactly(0, 1000);

            expect(encodeMidiMessage).to.have.been.calledOnce;
            expect(encodeMidiMessage).to.have.been.calledWithExactly(event);

            expect(midiOutputMock.send).to.have.been.calledOnce;
            expect(midiOutputMock.send).to.have.been.calledWithExactly(sequence, 700);
        });

        it('should return a promise', () => {
            expect(midiPlayer.play()).to.be.a('promise');
        });

        it('should resolve the promise after playing the track', () => {
            midiFileSlicerMock.slice.returns([ { event: { delta: 0, endOfTrack: true }, time: 0 } ]);

            return midiPlayer.play();
        });

    });

});
