import { clearInterval, setInterval } from 'worker-timers';
import { createMidiFileSlicer } from './factories/midi-file-slicer';
import { createMidiPlayerFactory } from './factories/midi-player-factory';
import { IMidiPlayer, IMidiPlayerFactoryOptions } from './interfaces';
import { Scheduler } from './scheduler';

export * from './interfaces';

const scheduler = new Scheduler(clearInterval, performance, setInterval);

const createMidiPlayer = createMidiPlayerFactory(createMidiFileSlicer, scheduler);

export const create = (options: IMidiPlayerFactoryOptions): IMidiPlayer => createMidiPlayer(options);
