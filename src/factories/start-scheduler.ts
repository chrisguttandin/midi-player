import { IInterval } from '../interfaces';

const INTERVAL = 500;

export const createStartScheduler =
    (clearInterval: Window['clearInterval'], performance: Window['performance'], setInterval: Window['setInterval']) =>
    (next: (interval: IInterval) => void) => {
        const currentTime = performance.now();

        let nextTick = currentTime + INTERVAL;

        const intervalId = setInterval(() => {
            if (performance.now() >= nextTick) {
                nextTick += INTERVAL;

                next({ end: nextTick + INTERVAL, start: nextTick });
            }
        }, INTERVAL / 10);

        next({ end: nextTick + INTERVAL, start: currentTime });

        return () => {
            clearInterval(intervalId);
        };
    };
