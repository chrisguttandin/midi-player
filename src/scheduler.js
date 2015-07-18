'use strict';

var di = require('di'),
    EventEmitter = require('events').EventEmitter,
    Performance = require('./injector/performance.js'),
    WorkerTimers = require('./injector/worker-timers.js');

const INTERVAL = 500;

class Scheduler extends EventEmitter {

    constructor (performance, workerTimers) {
        super();

        this._lookahead = performance.now() + (INTERVAL * 2);
        this._performance = performance;

        workerTimers.setInterval(::this._advance, INTERVAL / 10);
    }

    get currentTime () {
        return this._performance.now();
    }

    get lookahead () {
        return this._lookahead;
    }

    _advance () {
        if (this._performance.now() >= (this._lookahead - INTERVAL)) {
            let previousLookahead = this._lookahead;

            this._lookahead += INTERVAL;

            this.emit('advanced', previousLookahead, this._lookahead);
        }
    }

}

di.annotate(Scheduler, new di.Inject(Performance, WorkerTimers));

module.exports.Scheduler = Scheduler;
