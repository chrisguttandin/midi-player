import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStartIntervalScheduler } from '../../../src/factories/start-interval-scheduler';

describe('createStartIntervalScheduler()', () => {
    let clearInterval;
    let performance;
    let setInterval;
    let startIntervalScheduler;

    beforeEach(() => {
        clearInterval = vi.fn();
        performance = { now: vi.fn() };
        setInterval = vi.fn();

        startIntervalScheduler = createStartIntervalScheduler(clearInterval, performance, setInterval);
    });

    it('should return a function', () => {
        expect(startIntervalScheduler).to.be.a('function');
    });

    describe('startIntervalScheduler()', () => {
        let handler;
        let intervalId;
        let next;

        beforeEach(() => {
            next = vi.fn();

            performance.now.mockReturnValue(3000);
            setInterval.mockImplementation((...args) => {
                [handler] = args;

                return intervalId;
            });
        });

        it('should call performance.now()', () => {
            startIntervalScheduler(next);

            expect(performance.now).to.have.been.calledOnceWith();
        });

        it('should call setInterval()', () => {
            startIntervalScheduler(next);

            expect(setInterval).to.have.been.calledOnceWith(handler, 50);
            expect(handler).to.be.a('function');
        });

        it('should call next()', () => {
            startIntervalScheduler(next);

            expect(next).to.have.been.calledOnceWith({ end: 4000, start: 3000 });
        });

        it('should not call next() when invoking the handler within the interval', () => {
            startIntervalScheduler(next);

            next.mockClear();
            performance.now.mockClear();
            performance.now.mockReturnValue(3400);

            handler();

            expect(next).to.have.not.been.called;
            expect(performance.now).to.have.been.calledOnceWith();
        });

        it('should call next() when invoking the handler after the interval', () => {
            startIntervalScheduler(next);

            next.mockClear();
            performance.now.mockClear();
            performance.now.mockReturnValue(3500);

            handler();

            expect(next).to.have.been.calledOnceWith({ end: 4500, start: 4000 });
            expect(performance.now).to.have.been.calledOnceWith();
        });

        it('should return an array with two functions', () => {
            const array = startIntervalScheduler(next);

            expect(array.length).to.equal(2);

            const [peekScheduler, stopScheduler] = array;

            expect(peekScheduler).to.be.a('function');
            expect(stopScheduler).to.be.a('function');
        });

        describe('peekScheduler()', () => {
            let peekScheduler;

            beforeEach(() => {
                [peekScheduler] = startIntervalScheduler(next);

                performance.now.mockClear();
                performance.now.mockReturnValue(4000);
            });

            it('should call performance.now()', () => {
                peekScheduler();

                expect(performance.now).to.have.been.calledOnceWith();
            });

            it('should return the time returned by performance.now()', () => {
                expect(peekScheduler()).to.equal(4000);
            });
        });

        describe('stopScheduler()', () => {
            let stopScheduler;

            beforeEach(() => {
                [, stopScheduler] = startIntervalScheduler(next);
            });

            it('should call clearInterval()', () => {
                stopScheduler();

                expect(clearInterval).to.have.been.calledOnceWith(intervalId);
            });

            it('should return undefined', () => {
                expect(stopScheduler()).to.be.undefined;
            });
        });
    });
});
