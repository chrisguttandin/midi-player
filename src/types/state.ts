import type { createStartScheduler } from '../factories/start-scheduler';

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

          stopScheduler: ReturnType<ReturnType<typeof createStartScheduler>>[1];

          resolve(): void;
      }
    | {
          endedTracks: number;

          offset: number;

          peekScheduler: ReturnType<ReturnType<typeof createStartScheduler>>[0];

          stopScheduler: ReturnType<ReturnType<typeof createStartScheduler>>[1];

          resolve(): void;
      };
