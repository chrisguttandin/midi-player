import { Inject, Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { Observer } from 'rxjs/Observer';
import { merge } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { IInterval } from './interfaces';
import { performance } from './providers/performance';
import { TWorkerTimers, workerTimers } from './providers/worker-timers';

const INTERVAL = 500;

@Injectable()
export class Scheduler {

    private _intervalId: null | number;

    private _nextTick: number;

    private _numberOfSubscribers: number;

    private _subject: Subject<IInterval>;

    constructor (
        @Inject(performance) private _performance: Performance,
        @Inject(workerTimers) private _workerTimers: TWorkerTimers
    ) {
        this._nextTick = 0;
        this._numberOfSubscribers = 0;
        this._subject = new Subject();
    }

    public subscribe (observer: Observer<IInterval>) {
        this._numberOfSubscribers += 1;

        const currentTime = this._performance.now();

        if (this._numberOfSubscribers === 1) {
            this._start(currentTime);
        }

        const subscription = of({ end: this._nextTick + INTERVAL, start: currentTime })
            .pipe(
                merge(this._subject)
            )
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

    private _start (currentTime: number) {
        this._nextTick = currentTime + INTERVAL;

        this._intervalId = this._workerTimers.setInterval(() => {
            if (this._performance.now() >= this._nextTick) {
                this._nextTick += INTERVAL;

                this._subject.next({ end: this._nextTick + INTERVAL, start: this._nextTick });
            }
        }, INTERVAL / 10);
    }

    private _stop () {
        if (this._intervalId !== null) {
            this._workerTimers.clearInterval(this._intervalId);
        }

        this._intervalId = null;
    }

}
