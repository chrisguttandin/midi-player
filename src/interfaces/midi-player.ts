export interface IMidiPlayer {
    position: null | number;

    state: 'paused' | 'playing' | 'stopped';

    pause(): void;

    play(): Promise<void>;

    resume(): Promise<void>;

    stop(): void;
}
