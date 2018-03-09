import { clearInterval, setInterval } from 'worker-timers';
import { createMidiFileSlicer } from './factories/midi-file-slicer';
import { createMidiPlayerFactory } from './factories/midi-player-factory';
import { Scheduler } from './scheduler';
import { TMidiPlayerFactory } from './types';

export * from './interfaces';
export * from './types';

const scheduler = new Scheduler(clearInterval, performance, setInterval);

const createMidiPlayer = createMidiPlayerFactory(createMidiFileSlicer, scheduler);

export const create: TMidiPlayerFactory = (options) => createMidiPlayer(options);
