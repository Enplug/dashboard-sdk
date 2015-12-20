module.exports = function (grunt) {
    try {
        return grunt.file.readJSON('grunt/aws.private.json');
    } catch (e) {}
};
