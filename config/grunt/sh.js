module.exports = () => {
    return {
        'build': {
            cmd: 'npm run build'
        },
        'test-expectation-chrome': {
            cmd: 'npm run test:expectation-chrome'
        },
        'test-expectation-chrome-canary': {
            cmd: 'npm run test:expectation-chrome-canary'
        },
        'test-unit': {
            cmd: 'npm run test:unit'
        }
    };
};
