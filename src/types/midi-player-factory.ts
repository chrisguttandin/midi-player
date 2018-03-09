import { IMidiPlayer, IMidiPlayerFactoryOptions } from '../interfaces';

export type TMidiPlayerFactory = (options: IMidiPlayerFactoryOptions) => IMidiPlayer;
