'use strict';

var di = require('di'),
    WorkerTimers = require('../../src/injector/worker-timers.js'),
    workerTimersMock = require('worker-timers-mock'),
    WorkerTimersMock,
    sinon = require('sinon');

function injector () {

    if (WorkerTimersMock === undefined) {

        WorkerTimersMock = workerTimersMock;

    } else {

        WorkerTimersMock.resetInterval();

    }

    return WorkerTimersMock;

}

di.annotate(injector, new di.Provide(WorkerTimers));

module.exports = injector;
