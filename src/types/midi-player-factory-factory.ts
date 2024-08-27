import { TMidiFileSlicerFactory, TMidiPlayerFactory } from '.';
import { createStartIntervalScheduler } from '../factories/start-interval-scheduler';
import { createStartTimeoutScheduler } from '../factories/start-timeout-scheduler';

export type TMidiPlayerFactoryFactory = (
    createMidiFileSlicer: TMidiFileSlicerFactory,
    startIntervalScheduler: ReturnType<typeof createStartIntervalScheduler>,
    startTimeoutScheduler: ReturnType<typeof createStartTimeoutScheduler>
) => TMidiPlayerFactory;
