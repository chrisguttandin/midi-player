import { clearInterval, setInterval } from 'worker-timers';
import { createMidiFileSlicer } from './factories/midi-file-slicer';
import { createMidiPlayerFactory } from './factories/midi-player-factory';
import { Scheduler } from './scheduler';
import { TMidiPlayerFactory } from './types';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const scheduler = new Scheduler(clearInterval, performance, setInterval);

const createMidiPlayer = createMidiPlayerFactory(createMidiFileSlicer, scheduler);

export const create: TMidiPlayerFactory = (options) => createMidiPlayer(options);
