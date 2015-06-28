'use strict';

var di = require('di'),
    injector,
    midiPlayerInjector = require('./midi-player.js').midiPlayerInjector;

injector = new di.Injector();

module.exports.MidiPlayer = injector.get(midiPlayerInjector);
