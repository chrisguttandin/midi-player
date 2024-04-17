import { Observer, Subject, merge, of } from 'rxjs';
import { IInterval } from '../interfaces';

const INTERVAL = 500;

export const createStartScheduler =
    (clearInterval: Window['clearInterval'], performance: Window['performance'], setInterval: Window['setInterval']) =>
    (observer: Partial<Observer<IInterval>>) => {
        const currentTime = performance.now();
        const subject = new Subject<IInterval>();

        let nextTick = currentTime + INTERVAL;

        const intervalId = setInterval(() => {
            if (performance.now() >= nextTick) {
                nextTick += INTERVAL;

                subject.next({ end: nextTick + INTERVAL, start: nextTick });
            }
        }, INTERVAL / 10);

        const subscription = merge(of({ end: nextTick + INTERVAL, start: currentTime }), subject).subscribe(observer);

        return () => {
            clearInterval(intervalId);

            return subscription.unsubscribe();
        };
    };
