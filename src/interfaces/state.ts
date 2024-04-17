export interface IState {
    endedTracks: number;

    offset: number;

    stopScheduler: null | (() => void);

    resolve(): void;
}
