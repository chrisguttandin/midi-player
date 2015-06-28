'use strict';

var di = require('di'),
    workerTimers = require('worker-timers');

function injector () {
    return workerTimers;
}

di.annotate(injector);

module.exports = injector;
