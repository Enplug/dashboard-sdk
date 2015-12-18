module.exports = {
    options: {
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'dist/sdk.js',
            'test/*.js',
        ],
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
    },
    unit: {
        singleRun: true,
        preprocessors: {
            'dist/sdk.js': 'coverage'
        },
        reporters: ['coverage', 'progress'],
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/',
        },
    },
};
