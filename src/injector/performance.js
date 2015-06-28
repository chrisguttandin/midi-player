'use strict';

var di = require('di');

function injector () {
    return window.performance;
}

di.annotate(injector);

module.exports = injector;
