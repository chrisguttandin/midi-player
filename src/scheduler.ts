import { performance } from './providers/performance';
import { workerTimers } from './providers/worker-timers';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const INTERVAL = 500;

@Injectable()
export class Scheduler {

    private _intervalId;

    private _nextTick;

    private _numberOfSubscribers;

    private _subject;

    private _workerTimers;

    constructor (
        @Inject(performance) private _performance,
        @Inject(workerTimers) workerTimers
    ) {
        this._nextTick = 0;
        this._numberOfSubscribers = 0;
        this._subject = new Subject();
        this._workerTimers = workerTimers;
    }

    private _start (currentTime) {
        this._nextTick = currentTime + INTERVAL;

        this._intervalId = this._workerTimers.setInterval(() => {
            if (this._performance.now() >= this._nextTick) {
                this._nextTick += INTERVAL;

                this._subject.next({ end: this._nextTick + INTERVAL, start: this._nextTick });
            }
        }, INTERVAL / 10);
    }

    private _stop () {
        this._workerTimers.clearInterval(this._intervalId);
        this._intervalId = null;
    }

    public subscribe (observer) {
        this._numberOfSubscribers += 1;

        const currentTime = this._performance.now();

        if (this._numberOfSubscribers === 1) {
            this._start(currentTime);
        }

        const subscription = Observable
            .of({ end: this._nextTick + INTERVAL, start: currentTime })
            .merge(this._subject)
            .subscribe(observer);

        const unsubscribe = () => {
            this._numberOfSubscribers -= 1;

            if (this._numberOfSubscribers === 0) {
                this._stop();
            }

            return subscription.unsubscribe();
        };

        return { unsubscribe };
    }

}
