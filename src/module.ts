import { Injector } from '@angular/core';
import 'core-js/es7/reflect'; // tslint:disable-line:ordered-imports
import { MIDI_FILE_SLICER_FACTORY_PROVIDER } from './factories/midi-file-slicer';
import { MIDI_PLAYER_FACTORY_PROVIDER, MidiPlayerFactory } from './factories/midi-player';
import { MIDI_MESSAGE_ENCODER_PROVIDER } from './midi-message-encoder';
import { PERFORMANCE_PROVIDER } from './providers/performance';
import { WORKER_TIMERS_PROVIDER } from './providers/worker-timers';
import { SCHEDULER_PROVIDER } from './scheduler';

const injector = Injector.create([
    MIDI_FILE_SLICER_FACTORY_PROVIDER,
    MIDI_MESSAGE_ENCODER_PROVIDER,
    MIDI_PLAYER_FACTORY_PROVIDER,
    PERFORMANCE_PROVIDER,
    SCHEDULER_PROVIDER,
    WORKER_TIMERS_PROVIDER
]);

export const midiPlayerFactory = injector.get(MidiPlayerFactory);
