export interface IState {
    endedTracks: number;

    offset: number;

    schedulerSubscription: null | { unsubscribe(): void };

    resolve(): void;
}
