import { TMidiFileSlicerFactory, TMidiPlayerFactory } from '.';
import { createStartScheduler } from '../factories/start-scheduler';

export type TMidiPlayerFactoryFactory = (
    createMidiFileSlicer: TMidiFileSlicerFactory,
    startScheduler: ReturnType<typeof createStartScheduler>
) => TMidiPlayerFactory;
