import { PlayerState } from '../types/player-state';

export interface IMidiPlayer {
    play(): Promise<void>;

    pause(): void;

    resume(): Promise<void>;

    stop(): void;

    get state(): PlayerState;
}
