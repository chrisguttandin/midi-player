import { PlayerState } from '../types/player-state';

export interface IMidiPlayer {
    readonly state: PlayerState;

    pause(): void;

    play(): Promise<void>;

    resume(): Promise<void>;

    stop(): void;
}
