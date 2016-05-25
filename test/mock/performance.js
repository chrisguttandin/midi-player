import { stub } from 'sinon';

export function PerformanceMock () {
    return {
        now: stub()
    };
};
