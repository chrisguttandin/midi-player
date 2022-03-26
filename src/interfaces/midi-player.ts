export interface IMidiPlayer {
    play(): Promise<void>;

    pause(): void;

    resume(): void;

    stop(): void;

    get playing(): boolean;
}
