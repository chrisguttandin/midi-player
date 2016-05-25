import { stub } from 'sinon';

export class SchedulerMock {

    constructor () {
        this.on = stub();
        this.removeListener = stub();
    }

}
