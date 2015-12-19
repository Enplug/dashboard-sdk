module.exports = {
    modules: {

        // order matters
        src: [
            'src/transport.js',
            'src/sender.js',
            'src/*.js',
            'src/angular-enplug.js'
        ],
        dest: 'dist/sdk.js'
    }
};
