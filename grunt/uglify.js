module.exports = {
    options: {
        mangle: true
    },
    build: {
        files: {
            'dist/sdk.min.js': 'dist/sdk.js'
        }
    }
};
