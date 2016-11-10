import { EventEmitter } from 'events';
import { Inject } from '@angular/core';
import { Performance } from './injector/performance';
import { WorkerTimers } from './injector/worker-timers';

const INTERVAL = 500;

export class Scheduler extends EventEmitter {

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

Scheduler.parameters = [ [ new Inject(Performance) ], [ new Inject(WorkerTimers) ] ];
