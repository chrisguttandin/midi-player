import { clearInterval, clearTimeout, setInterval, setTimeout } from 'worker-timers';
import { createMidiFileSlicer } from './factories/midi-file-slicer';
import { createMidiPlayerFactory } from './factories/midi-player-factory';
import { createStartIntervalScheduler } from './factories/start-interval-scheduler';
import { createStartTimeoutScheduler } from './factories/start-timeout-scheduler';
import { TMidiPlayerFactory } from './types';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const createMidiPlayer = createMidiPlayerFactory(
    createMidiFileSlicer,
    createStartIntervalScheduler(clearInterval, performance, setInterval),
    createStartTimeoutScheduler(clearTimeout, setTimeout)
);

export const create: TMidiPlayerFactory = (options) => createMidiPlayer(options);
