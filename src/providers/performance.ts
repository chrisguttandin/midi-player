import { OpaqueToken } from '@angular/core';

export const performance = new OpaqueToken('PERFORMANCE');

export const PERFORMANCE_PROVIDER = { provide: performance, useValue: window.performance };
