import type { createStartIntervalScheduler } from '../factories/start-interval-scheduler';

export interface IState {
    endedTracks: number;

    offset: number;

    stopScheduler: null | ReturnType<ReturnType<typeof createStartIntervalScheduler>>;

    resolve(): void;
}
