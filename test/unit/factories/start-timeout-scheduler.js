import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStartTimeoutScheduler } from '../../../src/factories/start-timeout-scheduler';

describe('createStartTimeoutScheduler()', () => {
    let clearTimeout;
    let setTimeout;
    let startTimeoutScheduler;

    beforeEach(() => {
        clearTimeout = vi.fn();
        setTimeout = vi.fn();

        startTimeoutScheduler = createStartTimeoutScheduler(clearTimeout, setTimeout);
    });

    it('should return a function', () => {
        expect(startTimeoutScheduler).to.be.a('function');
    });

    describe('startTimeoutScheduler()', () => {
        let handler;
        let timeout;
        let timeoutId;

        beforeEach(() => {
            handler = 'a fake handler';
            timeout = 50;

            setTimeout.mockReturnValue(timeoutId);
        });

        it('should call setTimeout()', () => {
            startTimeoutScheduler(handler, timeout);

            expect(setTimeout).to.have.been.calledOnceWith(handler, timeout);
        });

        it('should return a function', () => {
            expect(startTimeoutScheduler(handler, timeout)).to.be.a('function');
        });

        describe('stopScheduler()', () => {
            let stopScheduler;

            beforeEach(() => {
                stopScheduler = startTimeoutScheduler(handler, timeout);
            });

            it('should call clearTimeout()', () => {
                stopScheduler();

                expect(clearTimeout).to.have.been.calledOnceWith(timeoutId);
            });

            it('should return undefined', () => {
                expect(stopScheduler()).to.be.undefined;
            });
        });
    });
});
