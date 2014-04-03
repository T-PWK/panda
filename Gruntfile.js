
function gruntConfig (grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        // ### Config for grunt-contrib-jshint
        // JSHint all the things!
        jshint: {
            server: {
                directives: {
                    node: true,
                    browser: false,
                    todo: true
                },
                files: {
                    src: [
                        'core/server/**/*.js', 'core/index.js', 'core/server.js'
                    ]
                }
            },
            client: {
                directives: {
                    node: false,
                    browser: true,
                    nomen: true,
                    todo: true
                },
                options: {
                    globals: {
                        angular:false,  // angular library
                        _:false         // underscore library
                    }
                },
                src: [
                    'core/client/js/app/**/*.js',
                ]
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