module.exports = {
    options: {
        files: [
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'dist/sdk.js',
            'test/*.js',
        ],
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
    },
    unit: {
        singleRun: true,
        preprocessors: {
            'dist/sdk.js': 'coverage',
        },
        reporters: ['coverage', 'progress'],
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/',
        },
    },
};
