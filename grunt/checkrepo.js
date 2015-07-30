module.exports = {
    version: {
        tag: {
            valid: '<%= pkg.version %>', // Check if pkg.version is valid semantic version
            eq: '<%= pkg.version %>'    // Check to make sure our version is same because we haven't incremented yet
        },
        tagged: false, // make sure last commit wasn't tagged
        clean: true // Require repo to be clean (no unstaged changes)
    },
    release: {
        tag: {
            valid: '<%= pkg.version %>',
            lt: '<%= pkg.version %>' // highest repo tag should match our current one
        },
        tagged: false, // make sure we're on the tagged commit
        clean: true
    }
};