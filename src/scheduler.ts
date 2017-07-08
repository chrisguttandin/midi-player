import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/merge';
import { IInterval } from './interfaces';
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

    public subscribe (observer: Observer<IInterval>) {
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
