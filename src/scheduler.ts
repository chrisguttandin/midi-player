import { Observer, Subject, merge, of } from 'rxjs';
import { IInterval } from './interfaces';

const INTERVAL = 500;

export class Scheduler {
    private _intervalId: null | number;

    private _nextTick: number;

    private _numberOfSubscribers: number;

    private _subject: Subject<IInterval>;

    constructor(
        private _clearInterval: Window['clearInterval'],
        private _performance: Window['performance'],
        private _setInterval: Window['setInterval']
    ) {
        this._intervalId = null;
        this._nextTick = 0;
        this._numberOfSubscribers = 0;
        this._subject = new Subject();
    }

    public get performance(): Window['performance'] {
        return this._performance;
    }

    public subscribe(observer: Partial<Observer<IInterval>>): { unsubscribe(): void } {
        this._numberOfSubscribers += 1;

        const currentTime = this._performance.now();

        if (this._numberOfSubscribers === 1) {
            this._start(currentTime);
        }

        // tslint:disable-next-line:deprecation
        const subscription = merge(of({ end: this._nextTick + INTERVAL, start: currentTime }), this._subject).subscribe(observer);

        const unsubscribe = () => {
            this._numberOfSubscribers -= 1;

            if (this._numberOfSubscribers === 0) {
                this._stop();
            }

            return subscription.unsubscribe();
        };

        return { unsubscribe };
    }

    private _start(currentTime: number): void {
        this._nextTick = currentTime + INTERVAL;

        this._intervalId = this._setInterval(() => {
            if (this._performance.now() >= this._nextTick) {
                this._nextTick += INTERVAL;

                this._subject.next({ end: this._nextTick + INTERVAL, start: this._nextTick });
            }
        }, INTERVAL / 10);
    }

    private _stop(): void {
        if (this._intervalId !== null) {
            this._clearInterval(this._intervalId);
        }

        this._intervalId = null;
    }
}
