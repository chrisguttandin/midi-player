// This is an incomplete version of the MIDIOutput specification.

export interface IMidiOutput {
    clear?(): void;

    send(data: number[] | Uint8Array, timestamp?: number): void;
}
