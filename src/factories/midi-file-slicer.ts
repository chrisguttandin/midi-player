import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile } from 'midi-json-parser-worker';

export const createMidiFileSlicer = (json: IMidiFile): MidiFileSlicer => new MidiFileSlicer({ json });
