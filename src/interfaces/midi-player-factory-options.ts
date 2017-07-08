import { IMidiFile } from 'midi-json-parser-worker';
import { IMidiOutput } from './midi-output';

export interface IMidiPlayerFactoryOptions {

    json: IMidiFile;

    midiOutput: IMidiOutput;

}
