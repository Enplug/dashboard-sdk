module.exports = {
    // Build modules first for registering components on them
    modules: {
        src: [
            'src/**/module.js'
        ],
        dest: 'tmp/modules.js'
    },
    // Exclude modules from second round, include templates file
    components: {
        src: [
            'src/sdk.js', // Take this first
            'tmp/modules.js',
            'src/**/*.js',
            // Exclude
            '!src/**/module.js' // we already included these
        ],
        dest: 'dist/angular-enplug.js'
    }
};
