'use strict';

import { stub } from 'sinon';

export class MidiMessageEncoderMock {

    constructor () {
        this.encode = stub();
    }

}
