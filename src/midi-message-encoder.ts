export class MidiMessageEncoder {

    public encode (event) {
        if ('controllerChange' in event) {
            let controllerChange = event.controllerChange;

            return [
                0xB0 | event.channel, // tslint:disable-line:no-bitwise
                controllerChange.type,
                controllerChange.value
            ];
        }

        if ('noteOff' in event) {
            let noteOff = event.noteOff;

            return [
                0x80 | event.channel, // tslint:disable-line:no-bitwise
                noteOff.noteNumber,
                noteOff.velocity
            ];
        }

        if ('noteOn' in event) {
            let noteOn = event.noteOn;

            return [
                0x90 | event.channel, // tslint:disable-line:no-bitwise
                noteOn.noteNumber,
                noteOn.velocity
            ];
        }

        if ('programChange' in event) {
            return [
                0xC0 | event.channel, // tslint:disable-line:no-bitwise
                event.programChange.programNumber
            ];
        }
    }

}
