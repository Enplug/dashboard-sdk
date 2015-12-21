module.exports = {
    modules: {

        // order matters
        src: [
            'src/transport.js',
            'src/sender.js',
            'src/*.js',
            'src/angular-plugin.js'
        ],
        dest: 'dist/sdk.js'
    }
};
