import { TMidiFileSlicerFactory, TMidiPlayerFactory } from '.';
import { Scheduler } from '../scheduler';

export type TMidiPlayerFactoryFactory = (createMidiFileSlicer: TMidiFileSlicerFactory, scheduler: Scheduler) => TMidiPlayerFactory;
