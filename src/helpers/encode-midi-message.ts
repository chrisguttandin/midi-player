import { encode } from 'json-midi-message-encoder';
import { TMidiEvent } from 'midi-json-parser-worker';

export const encodeMidiMessage = (event: TMidiEvent): Uint8Array => {
    return new Uint8Array(encode(event));
};
