describe('MIDIOutput', () => {
    describe('clear()', () => {
        // #1 https://issues.chromium.org/issues/40411677

        it('should not be implemented', () => {
            expect(MIDIOutput.prototype.clear).to.be.undefined;
        });
    });
});
