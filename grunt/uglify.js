module.exports = {
    options: {
        mangle: false
    },
    build: {
        files: {
            'dist/sdk.min.js': 'dist/sdk.js'
        }
    }
};
