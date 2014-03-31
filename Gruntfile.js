
function gruntConfig (grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        // ### Config for grunt-contrib-jshint
        // JSHint all the things!
        jshint: {
            server_code: {
                src: [
                    'core/server/**/*.js',
                    'core/index.js',
                    'core/server.js'
                ]
            },
            client_code: {
                options: {
                    globals: {
                        angular:false,  // angular library
                        _:false         // underscore library
                    }
                },
                src: [
                    'core/client/js/app/**/*.js'
                ]
            }
        },
        uglify: {
            dynamic_mappings: {
                files: [
                    {
                        expand: true,
                        cwd: 'core/client/js/app/',
                        src: ['**/*.js'],
                        dest: 'core/client/js/app/',
                        ext: '.min.js',
                        extDot: 'first'
                    }
                ]
            }
        },
        concat:{
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: ['core/client/js/app/application.min.js', 'core/client/js/app/controllers.min.js'],
                dest: 'core/client/js/app/panda.min.js'
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('release', 'Release task - creates a final built zip\n', []);
    grunt.registerTask('help',
        'Outputs help information if you type `grunt help` instead of `grunt --help`',
        function () {
            console.log('Type `grunt --help` to get the details of available grunt tasks');
        }
    );
    grunt.registerTask('validate', 'Run code validation', ['jshint']);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
}

module.exports = gruntConfig;