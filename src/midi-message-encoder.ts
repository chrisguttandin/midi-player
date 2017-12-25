import { encode } from 'json-midi-message-encoder';
import { TMidiEvent } from 'midi-json-parser-worker';

export class MidiMessageEncoder {

    public encode (event: TMidiEvent) {
        return new Uint8Array(encode(event));
    }

}

export const MIDI_MESSAGE_ENCODER_PROVIDER = { deps: [ ], provide: MidiMessageEncoder };
