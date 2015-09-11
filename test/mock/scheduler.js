'use strict';

var di = require('di'),
    Scheduler = require('../../src/scheduler.js').Scheduler,
    SchedulerMock,
    sinon = require('sinon');

function injector () {

    if (SchedulerMock === undefined) {

        SchedulerMock = {
            on: sinon.stub(),
            removeListener: sinon.stub()
        };

    } else {

        SchedulerMock.on.reset();
        SchedulerMock.removeListener.reset();

    }

    return SchedulerMock;
}

di.annotate(injector, new di.Provide(Scheduler));

module.exports.SchedulerMock = injector;
