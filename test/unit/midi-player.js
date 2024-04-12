import { clearInterval, setInterval } from 'worker-timers';
import { spy, stub } from 'sinon';
import { MidiPlayer } from '../../src/midi-player';
import { Scheduler } from '../../src/scheduler';
import { midiFileSlicerMock } from '../mock/midi-file-slicer';
import { midiOutputMock } from '../mock/midi-output';
import { performanceMock } from '../mock/performance';

describe('MidiPlayer', () => {
    let filterMidiMessage;
    let encodeMidiMessage;
    let json;
    let midiPlayer;
    let scheduler;
    let sequence;

    beforeEach(() => {
        filterMidiMessage = stub();
        encodeMidiMessage = stub();

        json = {
            tracks: ['a fake track']
        };

        scheduler = new Scheduler(clearInterval, performanceMock, setInterval);

        midiPlayer = new MidiPlayer({
            encodeMidiMessage,
            filterMidiMessage,
            json,
            midiFileSlicer: midiFileSlicerMock,
            midiOutput: midiOutputMock,
            scheduler
        });

        sequence = 'a fake sequence';

        midiFileSlicerMock.slice.resetHistory();
        midiOutputMock.clear.resetHistory();
        midiOutputMock.send.resetHistory();
        performanceMock.now.resetHistory();

        filterMidiMessage.returns(true);
        encodeMidiMessage.returns(sequence);
        performanceMock.now.returns(200);
    });

    describe('play()', () => {
        describe('with no previous invocation', () => {
            it('should schedule all events up to the lookahead', () => {
                const event = {
                    noteOn: 'a fake note on event'
                };

                midiFileSlicerMock.slice.returns([{ event, time: 500 }]);

                midiPlayer.play();

                expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                expect(midiFileSlicerMock.slice).to.have.been.calledWithExactly(0, 1000);

                expect(filterMidiMessage).to.have.been.calledOnce;
                expect(filterMidiMessage).to.have.been.calledWithExactly(event);

                expect(encodeMidiMessage).to.have.been.calledOnce;
                expect(encodeMidiMessage).to.have.been.calledWithExactly(event);

                expect(midiOutputMock.send).to.have.been.calledOnce;
                expect(midiOutputMock.send).to.have.been.calledWithExactly(sequence, 700);
            });

            it('should return a promise', () => {
                expect(midiPlayer.play()).to.be.a('promise');
            });

            it('should resolve the promise after playing the track', () => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                return midiPlayer.play();
            });
        });

        describe('with one previous invocation', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();

                performanceMock.now.returns(1200);

                encodeMidiMessage.resetHistory();
                filterMidiMessage.resetHistory();
                midiFileSlicerMock.slice.resetHistory();
                midiOutputMock.send.resetHistory();
            });

            it('should schedule all events up to the lookahead', () => {
                const event = {
                    noteOn: 'a fake note on event'
                };

                midiFileSlicerMock.slice.returns([{ event, time: 500 }]);

                midiPlayer.play();

                expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                expect(midiFileSlicerMock.slice).to.have.been.calledWithExactly(0, 1000);

                expect(filterMidiMessage).to.have.been.calledOnce;
                expect(filterMidiMessage).to.have.been.calledWithExactly(event);

                expect(encodeMidiMessage).to.have.been.calledOnce;
                expect(encodeMidiMessage).to.have.been.calledWithExactly(event);

                expect(midiOutputMock.send).to.have.been.calledOnce;
                expect(midiOutputMock.send).to.have.been.calledWithExactly(sequence, 1700);
            });

            it('should return a promise', () => {
                expect(midiPlayer.play()).to.be.a('promise');
            });

            it('should resolve the promise after playing the track', () => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                return midiPlayer.play();
            });
        });
    });

    describe('stop()', () => {
        describe('when not playing', () => {
            it('should throw an error', () => {
                expect(() => midiPlayer.stop()).to.throw(Error, 'The player is already stopped.');
            });
        });

        describe('when playing', () => {
            let then;

            beforeEach(() => {
                then = spy();

                const event = {
                    noteOn: 'a fake note on event'
                };

                midiFileSlicerMock.slice.returns([{ event, time: 500 }]);

                midiPlayer.play().then(then);
            });

            it('should call clear() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.clear).to.have.been.calledOnce;
                expect(midiOutputMock.clear).to.have.been.calledWithExactly();
            });

            it('should return undefined', () => {
                expect(midiPlayer.stop()).to.be.undefined;
            });

            it('should resolve the promise returned by play()', async () => {
                midiPlayer.stop();

                expect(then).to.have.not.been.called;

                await Promise.resolve();

                expect(then).to.have.been.calledOnce;
            });
        });
    });
});
