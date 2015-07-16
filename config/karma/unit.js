'use strict';

module.exports = function (config) {

    config.set({

        browsers: [
            'ChromeCanary',
            'FirefoxDeveloper'
        ],

        files: [
            '../../test/unit/**/*.js'
        ],

        frameworks: [
            'browserify',
            'mocha',
            'sinon-chai' // implicitly uses chai too
        ],

        preprocessors: {
            '../../test/unit/**/*.js': 'browserify'
        }

    });

};
