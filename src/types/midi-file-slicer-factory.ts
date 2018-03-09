import { MidiFileSlicer } from 'midi-file-slicer';
import { IMidiFile } from 'midi-json-parser-worker';

export type TMidiFileSlicerFactory = (json: IMidiFile) => MidiFileSlicer;
