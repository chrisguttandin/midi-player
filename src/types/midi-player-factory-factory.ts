import { TMidiFileSlicerFactory, TMidiPlayerFactory } from '.';
import { createStartScheduler } from '../factories/start-scheduler';
import { createStartTimeoutScheduler } from '../factories/start-timeout-scheduler';

export type TMidiPlayerFactoryFactory = (
    createMidiFileSlicer: TMidiFileSlicerFactory,
    startScheduler: ReturnType<typeof createStartScheduler>,
    startTimeoutScheduler: ReturnType<typeof createStartTimeoutScheduler>
) => TMidiPlayerFactory;
