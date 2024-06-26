import { spy, stub } from 'sinon';
import { createStartScheduler } from '../../../src/factories/start-scheduler';

describe('createStartScheduler()', () => {
    let clearInterval;
    let startScheduler;
    let performance;
    let setInterval;

    beforeEach(() => {
        clearInterval = spy();
        performance = { now: stub() };
        setInterval = stub();

        startScheduler = createStartScheduler(clearInterval, performance, setInterval);
    });

    it('should return a function', () => {
        expect(startScheduler).to.be.a('function');
    });

    describe('startScheduler()', () => {
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
            startScheduler(next);

            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should call setInterval()', () => {
            startScheduler(next);

            expect(setInterval).to.have.been.calledOnceWithExactly(handler, 50);
            expect(handler).to.be.a('function');
        });

        it('should call next()', () => {
            startScheduler(next);

            expect(next).to.have.been.calledOnceWithExactly({ end: 4000, start: 3000 });
        });

        it('should not call next() when invoking the handler within the interval', () => {
            startScheduler(next);

            next.resetHistory();
            performance.now.resetHistory();
            performance.now.returns(3400);

            handler();

            expect(next).to.have.not.been.called;
            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should call next() when invoking the handler after the interval', () => {
            startScheduler(next);

            next.resetHistory();
            performance.now.resetHistory();
            performance.now.returns(3500);

            handler();

            expect(next).to.have.been.calledOnceWithExactly({ end: 4500, start: 4000 });
            expect(performance.now).to.have.been.calledOnceWithExactly();
        });

        it('should return a function', () => {
            expect(startScheduler(next)).to.be.a('function');
        });

        describe('stopScheduler()', () => {
            it('should call clearInterval()', () => {
                startScheduler(next)();

                expect(clearInterval).to.have.been.calledOnceWithExactly(intervalId);
            });
        });
    });
});
