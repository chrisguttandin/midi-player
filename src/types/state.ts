import type { createStartIntervalScheduler } from '../factories/start-interval-scheduler';

export type TState =
    | {
          endedTracks: number;

          offset: number;

          peekScheduler: null;

          stopScheduler: null;

          resolve(): void;
      }
    | {
          endedTracks: number;

          offset: number;

          peekScheduler: null;

          stopScheduler: ReturnType<ReturnType<typeof createStartIntervalScheduler>>[1];

          resolve(): void;
      }
    | {
          endedTracks: number;

          offset: number;

          peekScheduler: ReturnType<ReturnType<typeof createStartIntervalScheduler>>[0];

          stopScheduler: ReturnType<ReturnType<typeof createStartIntervalScheduler>>[1];

          resolve(): void;
      };
