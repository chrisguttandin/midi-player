import { OpaqueToken } from '@angular/core';
import * as wrkrTmrs from 'worker-timers';

export const workerTimers = new OpaqueToken('WORKER_TIMERS');

export const WORKER_TIMERS_PROVIDER = { provide: workerTimers, useValue: wrkrTmrs };
