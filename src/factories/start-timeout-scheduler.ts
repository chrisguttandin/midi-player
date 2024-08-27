export const createStartTimeoutScheduler =
    (clearTimeout: Window['clearTimeout'], setTimeout: Window['setTimeout']) => (handler: () => void, timeout: number) => {
        const timeoutId = setTimeout(handler, timeout);

        return () => clearTimeout(timeoutId);
    };
