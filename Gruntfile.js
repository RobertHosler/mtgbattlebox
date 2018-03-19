module.exports = function(grunt) {

    grunt.initConfig({
        includeSource: {
            options: {
                basePath: 'client'
            },
            myTarget: {
                files: {
                    'client/index.html': 'client/app/index.tpl.html'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-include-source');

    // Default task(s).
    grunt.registerTask('default', ['includeSource']);

};