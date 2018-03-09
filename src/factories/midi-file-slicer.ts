import { MidiFileSlicer } from 'midi-file-slicer';
import { TMidiFileSlicerFactory } from '../types';

export const createMidiFileSlicer: TMidiFileSlicerFactory = (json) => new MidiFileSlicer({ json });
