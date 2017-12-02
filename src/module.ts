import { ReflectiveInjector } from '@angular/core';
import 'core-js/es7/reflect'; // tslint:disable-line:ordered-imports
import { MidiFileSlicerFactory } from './factories/midi-file-slicer';
import { MidiPlayerFactory } from './factories/midi-player';
import { MidiMessageEncoder } from './midi-message-encoder';
import { PERFORMANCE_PROVIDER } from './providers/performance';
import { WORKER_TIMERS_PROVIDER } from './providers/worker-timers';
import { Scheduler } from './scheduler';

const injector = ReflectiveInjector.resolveAndCreate([
    MidiFileSlicerFactory,
    MidiMessageEncoder,
    MidiPlayerFactory,
    PERFORMANCE_PROVIDER,
    Scheduler,
    WORKER_TIMERS_PROVIDER
]);

export const midiPlayerFactory = injector.get(MidiPlayerFactory);
