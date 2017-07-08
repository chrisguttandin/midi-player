import { InjectionToken } from '@angular/core';

export const performance = new InjectionToken<Performance>('PERFORMANCE');

export const PERFORMANCE_PROVIDER = { provide: performance, useValue: window.performance };
