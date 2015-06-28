'use strict';

var di = require('di'),
    Performance = require('../../src/injector/performance.js'),
    PerformanceMock,
    sinon = require('sinon');

function injector () {

    if (PerformanceMock === undefined) {

        PerformanceMock = {
            now: sinon.stub()
        };

    } else {

        PerformanceMock.now.reset();

    }

    return PerformanceMock;

}

di.annotate(injector, new di.Provide(Performance));

module.exports = injector;
