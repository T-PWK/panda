
function gruntConfig (grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        // ### Config for grunt-contrib-jshint
        // JSHint all the things!
        jshint: {
            src: [
                'core/**/*.js', 
                '!core/client/js/bootstrap.js', 
                '!core/client/js/bootstrap.min.js',
                '!core/client/js/string-1.8.0-min.js',
                '!core/client/js/underscore.string-2.3.2.min.js',
                '!core/client/js/underscore-1.6.0.min.js'
            ]
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