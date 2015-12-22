module.exports = {
    release: {
        options: {
            tag: 'v<%= pkg.version %>',
            message: 'Version <%= pkg.version %>',
        },
    },
};
