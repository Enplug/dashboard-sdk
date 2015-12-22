module.exports = {
    modules: {

        // order matters
        src: [
            'src/module.js',
            'src/transport.js',
            'src/sender.js',
            'src/account.js',
            'src/dashboard.js',
            'src/angular-plugin.js',
        ],
        dest: 'dist/sdk.js',
    },
};
