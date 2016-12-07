import { encode } from 'json-midi-message-encoder';

export class MidiMessageEncoder {

    public encode (event) {
        return new Uint8Array(encode(event));
    }

}
