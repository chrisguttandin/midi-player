import { clearInterval, setInterval } from 'worker-timers';
import { spy, stub } from 'sinon';
import { MidiPlayer } from '../../src/midi-player';
import { createStartScheduler } from '../../src/factories/start-scheduler';
import { midiFileSlicerMock } from '../mock/midi-file-slicer';
import { midiOutputMock } from '../mock/midi-output';
import { performanceMock } from '../mock/performance';

describe('MidiPlayer', () => {
    let filterMidiMessage;
    let encodeMidiMessage;
    let json;
    let midiPlayer;
    let sequence;
    let startScheduler;

    beforeEach(() => {
        filterMidiMessage = stub();
        encodeMidiMessage = stub();

        json = {
            tracks: ['a fake track']
        };

        startScheduler = createStartScheduler(clearInterval, performanceMock, setInterval);

        midiPlayer = new MidiPlayer({
            encodeMidiMessage,
            filterMidiMessage,
            json,
            midiFileSlicer: midiFileSlicerMock,
            midiOutput: midiOutputMock,
            startScheduler
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

    describe('pause()', () => {
        describe('when not playing', () => {
            it('should throw an error', () => {
                expect(() => midiPlayer.pause()).to.throw(Error, 'The player is not playing.');
            });
        });

        describe('when playing', () => {
            let then;

            beforeEach(() => {
                then = spy();

                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play().then(then);

                midiOutputMock.clear.resetHistory();
                midiOutputMock.send.resetHistory();
            });

            it('should call clear() on the midiOutput', () => {
                midiPlayer.pause();

                expect(midiOutputMock.clear).to.have.been.calledOnce;
                expect(midiOutputMock.clear).to.have.been.calledWithExactly();
            });

            it('should call send() on the midiOutput', () => {
                midiPlayer.pause();

                expect(midiOutputMock.send).to.have.been.callCount(16);
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([176, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([177, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([178, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([179, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([180, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([181, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([182, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([183, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([184, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([185, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([186, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([187, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([188, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([189, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([190, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([191, 120, 0]));
            });

            it('should return undefined', () => {
                expect(midiPlayer.pause()).to.be.undefined;
            });

            it('should resolve the promise returned by play()', async () => {
                midiPlayer.pause();

                expect(then).to.have.not.been.called;

                await Promise.resolve();

                expect(then).to.have.been.calledOnce;
            });
        });

        describe('when paused', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
                midiPlayer.pause();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.pause()).to.throw(Error, 'The player is not playing.');
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();

                performanceMock.now.returns(1200);
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.pause()).to.throw(Error, 'The player is not playing.');
            });
        });
    });

    describe('play()', () => {
        describe('when not playing', () => {
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

        describe('when playing', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.play()).to.throw(Error, 'The player is not stopped.');
            });
        });

        describe('when paused', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
                midiPlayer.pause();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.play()).to.throw(Error, 'The player is not stopped.');
            });
        });

        describe('when ended', () => {
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

    describe('resume()', () => {
        describe('when not playing', () => {
            it('should throw an error', () => {
                expect(() => midiPlayer.resume()).to.throw(Error, 'The player is not paused.');
            });
        });

        describe('when playing', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.resume()).to.throw(Error, 'The player is not paused.');
            });
        });

        describe('when paused', () => {
            let event;

            beforeEach(() => {
                event = {
                    noteOn: 'a fake note on event'
                };

                midiFileSlicerMock.slice.returns([{ event, time: 500 }]);

                midiPlayer.play();
                midiPlayer.pause();

                encodeMidiMessage.resetHistory();
                filterMidiMessage.resetHistory();
                midiFileSlicerMock.slice.resetHistory();
                midiOutputMock.send.resetHistory();
            });

            it('should schedule all events up to the lookahead', () => {
                midiPlayer.resume();

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
                expect(midiPlayer.resume()).to.be.a('promise');
            });

            it('should resolve the promise after playing the track', () => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                return midiPlayer.resume();
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();

                performanceMock.now.returns(1200);
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.resume()).to.throw(Error, 'The player is not paused.');
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

                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play().then(then);

                midiOutputMock.clear.resetHistory();
                midiOutputMock.send.resetHistory();
            });

            it('should call clear() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.clear).to.have.been.calledOnce;
                expect(midiOutputMock.clear).to.have.been.calledWithExactly();
            });

            it('should call send() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.send).to.have.been.callCount(16);
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([176, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([177, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([178, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([179, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([180, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([181, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([182, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([183, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([184, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([185, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([186, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([187, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([188, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([189, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([190, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWithExactly(new Uint8Array([191, 120, 0]));
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

        describe('when paused', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
                midiPlayer.pause();

                midiOutputMock.clear.resetHistory();
                midiOutputMock.send.resetHistory();
            });

            it('should not call clear() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.clear).to.have.not.been.called;
            });

            it('should not call send() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.send).to.have.not.been.called;
            });

            it('should return undefined', () => {
                expect(midiPlayer.stop()).to.be.undefined;
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.returns([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();

                performanceMock.now.returns(1200);
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.stop()).to.throw(Error, 'The player is already stopped.');
            });
        });
    });
});
