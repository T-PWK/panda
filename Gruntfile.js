
function gruntConfig (grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        // ### Config for grunt-contrib-jshint
        // JSHint all the things!
        jshint: {
            ignore_warning: {
                options: {
                    '-W015': true
                },
                src: ['core/**/*.js']
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('release', 
        'Release task - creates a final built zip\n',
        [] 
    );

    grunt.registerTask('help',
        'Outputs help information if you type `grunt help` instead of `grunt --help`',
        function () {
            console.log('Type `grunt --help` to get the details of available grunt tasks');
        }
    );

    grunt.registerTask('validate', 'Run code validation', ['jshint']);

    grunt.loadNpmTasks('grunt-contrib-jshint');
}

module.exports = gruntConfig;