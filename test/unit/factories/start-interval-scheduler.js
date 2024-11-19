import { spy, stub } from 'sinon';
import { createStartIntervalScheduler } from '../../../src/factories/start-interval-scheduler';

describe('createStartIntervalScheduler()', () => {
    let clearInterval;
    let performance;
    let setInterval;
    let startIntervalScheduler;

    beforeEach(() => {
        clearInterval = spy();
        performance = { now: stub() };
        setInterval = stub();

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
            next = spy();

            performance.now.returns(3000);
            setInterval.callsFake((...args) => {
                [handler] = args;

                return intervalId;
            });
        });

        it('should call performance.now()', () => {
            startIntervalScheduler(next);

            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should call setInterval()', () => {
            startIntervalScheduler(next);

            expect(setInterval).to.have.been.calledOnceWithExactly(handler, 50);
            expect(handler).to.be.a('function');
        });

        it('should call next()', () => {
            startIntervalScheduler(next);

            expect(next).to.have.been.calledOnceWithExactly({ end: 4000, start: 3000 });
        });

        it('should not call next() when invoking the handler within the interval', () => {
            startIntervalScheduler(next);

            next.resetHistory();
            performance.now.resetHistory();
            performance.now.returns(3400);

            handler();

            expect(next).to.have.not.been.called;
            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should call next() when invoking the handler after the interval', () => {
            startIntervalScheduler(next);

            next.resetHistory();
            performance.now.resetHistory();
            performance.now.returns(3500);

            handler();

            expect(next).to.have.been.calledOnceWithExactly({ end: 4500, start: 4000 });
            expect(performance.now).to.have.been.calledOnceWithExactly();
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

                performance.now.resetHistory();
                performance.now.returns(4000);
            });

            it('should call performance.now()', () => {
                peekScheduler();

                expect(performance.now).to.have.been.calledOnceWithExactly();
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

                expect(clearInterval).to.have.been.calledOnceWithExactly(intervalId);
            });

            it('should return undefined', () => {
                expect(stopScheduler()).to.be.undefined;
            });
        });
    });
});
