import { vi } from 'vitest';

export const midiOutputMock = {
    clear: vi.fn(),
    send: vi.fn()
};
