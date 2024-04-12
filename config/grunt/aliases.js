module.exports = {
    build: ['sh:build'],
    lint: ['sh:lint-config', 'sh:lint-src', 'sh:lint-test'],
    test: ['sh:test-expectation-chrome', 'sh:test-expectation-chrome-canary', 'sh:test-unit']
};
