import 'reflect-metadata';
import { MidiFileSlicerFactory } from './midi-file-slicer-factory';
import { MidiMessageEncoder } from './midi-message-encoder';
import { MidiPlayerFactory } from './midi-player-factory';
import { Performance } from './injector/performance';
import { ReflectiveInjector } from '@angular/core/src/di/reflective_injector';
import { Scheduler } from './scheduler';
import { WorkerTimers } from './injector/worker-timers';

/* eslint-disable indent */
const injector = ReflectiveInjector.resolveAndCreate([
          MidiFileSlicerFactory,
          MidiMessageEncoder,
          MidiPlayerFactory,
          Performance,
          Scheduler,
          WorkerTimers
      ]);
/* eslint-enable indent */

const midiPlayerFactory = injector.get(MidiPlayerFactory);

export function MidiPlayer (options) {
    return midiPlayerFactory.create(options);
};
