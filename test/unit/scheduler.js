'use strict';

var di = require('di'),
    PerformanceMock = require('../mock/performance.js'),
    Scheduler = require('../../src/scheduler.js').Scheduler,
    WorkerTimersMock = require('../mock/worker-timers.js');

describe('scheduler', function () {

    var injector,
        performance,
        scheduler,
        workerTimers;

    beforeEach(function () {
        injector = new di.Injector([
            PerformanceMock,
            WorkerTimersMock
        ]);

        performance = injector.get(PerformanceMock);
        workerTimers = injector.get(WorkerTimersMock);

        performance.now.returns(17000); // 17 seconds

        scheduler = injector.get(Scheduler);
    });

    describe('#advanced', function () {

        it('should fire an advanced event every half a second', function () {
            var advanced = sinon.stub();

            scheduler.on('advanced', advanced);

            performance.now.returns(17300);
            workerTimers.flushInterval(300);

            expect(advanced).to.not.been.called;

            performance.now.returns(17500);
            workerTimers.flushInterval(200);

            expect(advanced).to.been.calledOnce;

            performance.now.returns(17600);
            workerTimers.flushInterval(100);

            expect(advanced).to.been.calledOnce;

            performance.now.returns(18100);
            workerTimers.flushInterval(500);

            expect(advanced).to.been.calledTwice;
        });

        it('should emit the previous and the current lookahead', function () {
            var advanced = sinon.stub();

            scheduler.on('advanced', advanced);

            performance.now.returns(17500);
            workerTimers.flushInterval(500);

            expect(advanced).to.been.calledWithExactly(18000, 18500);

            performance.now.returns(18000);
            workerTimers.flushInterval(500);

            expect(advanced).to.been.calledWithExactly(18500, 19000);
        });

    });

    describe('currentTime', function () {

        it('should return the currentTime in relation to window.performance.now()', function () {
            expect(scheduler.currentTime).to.equal(17000);
        });

        it('should update the currentTime in relation to window.performance.now()', function () {
            performance.now.returns(20000); // 20 seconds

            expect(scheduler.currentTime).to.equal(20000);
        });

    });

    describe('lookahead', function () {

        it('should set the lookahead to one', function () {
            expect(scheduler.lookahead).to.equal(18000);
        });

        it('should grow in steps of 0.5 seconds as the timer advances', function () {
            performance.now.returns(17300);
            workerTimers.flushInterval(300);

            expect(scheduler.lookahead).to.equal(18000);

            performance.now.returns(17500);
            workerTimers.flushInterval(200);

            expect(scheduler.lookahead).to.equal(18500);

            performance.now.returns(17600);
            workerTimers.flushInterval(100);

            expect(scheduler.lookahead).to.equal(18500);

            performance.now.returns(18100);
            workerTimers.flushInterval(500);

            expect(scheduler.lookahead).to.equal(19000);
        });

    });

});
