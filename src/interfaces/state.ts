import type { createStartScheduler } from '../factories/start-scheduler';

export interface IState {
    endedTracks: number;

    offset: number;

    stopScheduler: null | ReturnType<ReturnType<typeof createStartScheduler>>;

    resolve(): void;
}
