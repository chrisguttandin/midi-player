import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MidiPlayer } from '../../src/midi-player';
import { midiFileSlicerMock } from '../mock/midi-file-slicer';
import { midiOutputMock } from '../mock/midi-output';
import { performanceMock } from '../mock/performance';

describe('MidiPlayer', () => {
    let encodeMidiMessage;
    let filterMidiMessage;
    let handler;
    let json;
    let midiPlayer;
    let next;
    let sequence;
    let startIntervalScheduler;
    let startTimeoutScheduler;
    let stopScheduler;

    beforeEach(() => {
        encodeMidiMessage = vi.fn();
        filterMidiMessage = vi.fn();
        startIntervalScheduler = vi.fn();
        startTimeoutScheduler = vi.fn();
        stopScheduler = vi.fn();

        json = {
            tracks: ['a fake track']
        };

        midiPlayer = new MidiPlayer({
            encodeMidiMessage,
            filterMidiMessage,
            json,
            midiFileSlicer: midiFileSlicerMock,
            midiOutput: midiOutputMock,
            startIntervalScheduler,
            startTimeoutScheduler
        });

        sequence = 'a fake sequence';

        midiFileSlicerMock.slice.mockClear();
        midiOutputMock.clear.mockClear();
        midiOutputMock.send.mockClear();
        performanceMock.now.mockClear();

        encodeMidiMessage.mockReturnValue(sequence);
        filterMidiMessage.mockReturnValue(true);
        performanceMock.now.mockReturnValue(200);
        startIntervalScheduler.mockImplementation((...args) => {
            [next] = args;

            const start = performanceMock.now();

            next({ end: start + 1000, start });

            return [() => performanceMock.now(), stopScheduler];
        });
        startTimeoutScheduler.mockImplementation((...args) => {
            [handler] = args;

            return stopScheduler;
        });
    });

    describe('position', () => {
        describe('when not playing', () => {
            it('should return zero', () => {
                expect(midiPlayer.position).to.equal(0);
            });
        });

        describe('when playing', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
            });

            describe('without any elapsed time', () => {
                it('should return zero', () => {
                    expect(midiPlayer.position).to.equal(0);
                });
            });

            describe('after 500 milliseconds', () => {
                beforeEach(() => {
                    performanceMock.now.mockReturnValue(500);
                });

                it('should return the elapsed time', () => {
                    expect(midiPlayer.position).to.equal(300);
                });
            });
        });

        describe('when paused', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
            });

            describe('without any elapsed time', () => {
                beforeEach(() => {
                    midiPlayer.pause();
                });

                it('should return zero', () => {
                    expect(midiPlayer.position).to.equal(0);
                });
            });

            describe('after 500 milliseconds', () => {
                beforeEach(() => {
                    performanceMock.now.mockReturnValue(500);

                    midiPlayer.pause();
                });

                it('should return the elapsed time', () => {
                    expect(midiPlayer.position).to.equal(300);
                });
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();
            });

            it('should return zero', () => {
                expect(midiPlayer.position).to.equal(0);
            });
        });
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
                then = vi.fn();

                midiFileSlicerMock.slice.mockReturnValue([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play().then(then);

                midiOutputMock.clear.mockClear();
                midiOutputMock.send.mockClear();
            });

            it('should call clear() on the midiOutput', () => {
                midiPlayer.pause();

                expect(midiOutputMock.clear).to.have.been.calledOnce;
                expect(midiOutputMock.clear).to.have.been.calledWith();
            });

            it('should call send() on the midiOutput', () => {
                midiPlayer.pause();

                expect(midiOutputMock.send.mock.calls.length).to.equal(16);
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([176, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([177, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([178, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([179, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([180, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([181, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([182, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([183, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([184, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([185, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([186, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([187, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([188, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([189, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([190, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([191, 120, 0]));
            });

            it('should call stopScheduler()', () => {
                midiPlayer.pause();

                expect(stopScheduler).to.have.been.calledOnce;
                expect(stopScheduler).to.have.been.calledWith();
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
                midiFileSlicerMock.slice.mockReturnValue([
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
                midiFileSlicerMock.slice.mockReturnValue([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.pause()).to.throw(Error, 'The player is not playing.');
            });
        });
    });

    describe('play()', () => {
        describe('when not playing', () => {
            describe('with a song not ending within the next interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        noteOn: 'a fake note on event'
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 700);

                    expect(stopScheduler).to.have.not.been.called;

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return an unresolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;
                });
            });

            describe('with a song ending at the start of the next interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        endOfTrack: true
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 0 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 200);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return a resolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
            });

            describe('with a song ending in the middle of the current interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        endOfTrack: true
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 700);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.been.calledOnce;
                    expect(startTimeoutScheduler).to.have.been.calledWith(handler, 500);
                });

                it('should return a promise which resolves when the handler gets called', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;

                    handler();

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
            });
        });

        describe('when playing', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([
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
                midiFileSlicerMock.slice.mockReturnValue([
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
                midiFileSlicerMock.slice.mockReturnValue([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                performanceMock.now.mockReturnValue(1200);

                encodeMidiMessage.mockClear();
                filterMidiMessage.mockClear();
                midiFileSlicerMock.slice.mockClear();
                midiOutputMock.send.mockClear();
                startIntervalScheduler.mockClear();
                stopScheduler.mockClear();
            });

            describe('with a song not ending within the next interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        noteOn: 'a fake note on event'
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 1700);

                    expect(stopScheduler).to.have.not.been.called;

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return an unresolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;
                });
            });

            describe('with a song ending at the start of the next interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        endOfTrack: true
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 0 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 1200);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return a resolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
            });

            describe('with a song ending in the middle of the current interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        endOfTrack: true
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.play();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 1700);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.been.calledOnce;
                    expect(startTimeoutScheduler).to.have.been.calledWith(handler, 500);
                });

                it('should return a promise which resolves when the handler gets called', async () => {
                    const then = vi.fn();

                    midiPlayer.play().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;

                    handler();

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
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
                midiFileSlicerMock.slice.mockReturnValue([
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
            describe('with a song not ending within the next interval', () => {
                let event;

                beforeEach(() => {
                    event = {
                        noteOn: 'another fake note on event'
                    };

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);

                    midiPlayer.play();
                    midiPlayer.pause();

                    encodeMidiMessage.mockClear();
                    filterMidiMessage.mockClear();
                    midiFileSlicerMock.slice.mockClear();
                    midiOutputMock.send.mockClear();
                    startIntervalScheduler.mockClear();
                    stopScheduler.mockClear();
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.resume();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(0, 1000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 700);

                    expect(stopScheduler).to.have.not.been.called;

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return an unresolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.resume().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;
                });
            });

            describe('with a song ending at the start of the next interval', () => {
                let event;

                beforeEach(() => {
                    event = { endOfTrack: true };

                    midiFileSlicerMock.slice.mockReturnValue([
                        {
                            event: {
                                noteOn: 'another fake note on event'
                            },
                            time: 500
                        }
                    ]);

                    midiPlayer.play();

                    performanceMock.now.mockReturnValue(1200);

                    midiPlayer.pause();

                    encodeMidiMessage.mockClear();
                    filterMidiMessage.mockClear();
                    midiFileSlicerMock.slice.mockClear();
                    midiOutputMock.send.mockClear();
                    startIntervalScheduler.mockClear();
                    stopScheduler.mockClear();

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 0 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.resume();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(1000, 2000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 1200);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.not.been.called;
                });

                it('should return a resolved promise', async () => {
                    const then = vi.fn();

                    midiPlayer.resume().then(then);

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
            });

            describe('with a song ending in the middle of the current interval', () => {
                let event;

                beforeEach(() => {
                    event = { endOfTrack: true };

                    midiFileSlicerMock.slice.mockReturnValue([
                        {
                            event: {
                                noteOn: 'another fake note on event'
                            },
                            time: 500
                        }
                    ]);

                    midiPlayer.play();

                    performanceMock.now.mockReturnValue(1200);

                    midiPlayer.pause();

                    encodeMidiMessage.mockClear();
                    filterMidiMessage.mockClear();
                    midiFileSlicerMock.slice.mockClear();
                    midiOutputMock.send.mockClear();
                    startIntervalScheduler.mockClear();
                    stopScheduler.mockClear();

                    midiFileSlicerMock.slice.mockReturnValue([{ event, time: 500 }]);
                });

                it('should schedule all events up to the lookahead', () => {
                    midiPlayer.resume();

                    expect(startIntervalScheduler).to.have.been.calledOnce;
                    expect(startIntervalScheduler).to.have.been.calledWith(next);

                    expect(midiFileSlicerMock.slice).to.have.been.calledOnce;
                    expect(midiFileSlicerMock.slice).to.have.been.calledWith(1000, 2000);

                    expect(filterMidiMessage).to.have.been.calledOnce;
                    expect(filterMidiMessage).to.have.been.calledWith(event);

                    expect(encodeMidiMessage).to.have.been.calledOnce;
                    expect(encodeMidiMessage).to.have.been.calledWith(event);

                    expect(midiOutputMock.send).to.have.been.calledOnce;
                    expect(midiOutputMock.send).to.have.been.calledWith(sequence, 1700);

                    expect(stopScheduler).to.have.been.calledOnce;
                    expect(stopScheduler).to.have.been.calledWith();

                    expect(startTimeoutScheduler).to.have.been.calledOnce;
                    expect(startTimeoutScheduler).to.have.been.calledWith(handler, 500);
                });

                it('should return a promise which resolves when the handler gets called', async () => {
                    const then = vi.fn();

                    midiPlayer.resume().then(then);

                    await Promise.resolve();

                    expect(then).to.have.not.been.called;

                    handler();

                    await Promise.resolve();

                    expect(then).to.have.been.calledOnce;
                });
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();
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
                then = vi.fn();

                midiFileSlicerMock.slice.mockReturnValue([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play().then(then);

                midiOutputMock.clear.mockClear();
                midiOutputMock.send.mockClear();
            });

            it('should call clear() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.clear).to.have.been.calledOnce;
                expect(midiOutputMock.clear).to.have.been.calledWith();
            });

            it('should call send() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.send.mock.calls.length).to.equal(16);
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([176, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([177, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([178, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([179, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([180, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([181, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([182, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([183, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([184, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([185, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([186, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([187, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([188, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([189, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([190, 120, 0]));
                expect(midiOutputMock.send).to.have.been.calledWith(new Uint8Array([191, 120, 0]));
            });

            it('should call stopScheduler()', () => {
                midiPlayer.stop();

                expect(stopScheduler).to.have.been.calledOnce;
                expect(stopScheduler).to.have.been.calledWith();
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
                midiFileSlicerMock.slice.mockReturnValue([
                    {
                        event: {
                            noteOn: 'a fake note on event'
                        },
                        time: 500
                    }
                ]);

                midiPlayer.play();
                midiPlayer.pause();

                midiOutputMock.clear.mockClear();
                midiOutputMock.send.mockClear();
                stopScheduler.mockClear();
            });

            it('should not call clear() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.clear).to.have.not.been.called;
            });

            it('should not call send() on the midiOutput', () => {
                midiPlayer.stop();

                expect(midiOutputMock.send).to.have.not.been.called;
            });

            it('should not call stopScheduler()', () => {
                midiPlayer.stop();

                expect(stopScheduler).to.have.not.been.called;
            });

            it('should return undefined', () => {
                expect(midiPlayer.stop()).to.be.undefined;
            });
        });

        describe('when ended', () => {
            beforeEach(() => {
                midiFileSlicerMock.slice.mockReturnValue([{ event: { delta: 0, endOfTrack: true }, time: 0 }]);

                midiPlayer.play();
            });

            it('should throw an error', () => {
                expect(() => midiPlayer.stop()).to.throw(Error, 'The player is already stopped.');
            });
        });
    });
});
