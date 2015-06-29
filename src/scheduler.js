'use strict';

var di = require('di'),
    EventEmitter = require('events').EventEmitter,
    Performance = require('./injector/performance.js'),
    WorkerTimers = require('./injector/worker-timers.js');

const INTERVAL = 0.5;

class Scheduler extends EventEmitter {

    constructor (performance, workerTimers) {
        super();

        this._lookahead = (performance.now() / 1000) + (INTERVAL * 2);
        this._performance = performance;

        workerTimers.setInterval(::this._advance, INTERVAL * 100);
    }

    get currentTime () {
        return this._performance.now() / 1000;
    }

    get lookahead () {
        return this._lookahead;
    }

    _advance () {
        if ((this._performance.now() / 1000) >= (this._lookahead - INTERVAL)) {
            let previousLookahead = this._lookahead;

            this._lookahead += INTERVAL;

            this.emit('advanced', previousLookahead, this._lookahead);
        }
    }

}

di.annotate(Scheduler, new di.Inject(Performance, WorkerTimers));

module.exports.Scheduler = Scheduler;
