import { InjectionToken } from '@angular/core';
import * as wrkrTmrs from 'worker-timers';

export interface IWorkerTimers {

    clearInterval: typeof wrkrTmrs.clearInterval;

    setInterval: typeof wrkrTmrs.setInterval;

}

export const workerTimers = new InjectionToken<IWorkerTimers>('WORKER_TIMERS');

export const WORKER_TIMERS_PROVIDER = { provide: workerTimers, useValue: wrkrTmrs };
