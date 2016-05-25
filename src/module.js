'use strict';

import { MidiFileSlicerFactory } from 'midi-file-slicer-factory';
import { MidiPlayerFactory } from 'midi-player-factory';
import { MidiMessageEncoder } from 'midi-message-encoder';
import { Performance } from 'injector/performance';
import { ReflectiveInjector } from '@angular/core/src/di/reflective_injector';
import { Scheduler } from 'scheduler';
import { WorkerTimers } from 'injector/worker-timers';

const injector = ReflectiveInjector.resolveAndCreate([
          MidiFileSlicerFactory,
          MidiPlayerFactory,
          MidiMessageEncoder,
          Performance,
          Scheduler,
          WorkerTimers
      ]);

const MidiPlayerFactory = injector.get(MidiPlayerFactory);

export { MidiPlayerFactory.create as MidiPlayer };
