import { InjectionToken } from '@angular/core';
import * as wrkrTmrs from 'worker-timers';

export type TWorkerTimers = typeof wrkrTmrs;

export const workerTimers = new InjectionToken<TWorkerTimers>('WORKER_TIMERS');

export const WORKER_TIMERS_PROVIDER = { provide: workerTimers, useValue: wrkrTmrs };
