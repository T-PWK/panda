
function gruntConfig (grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: {
                src: ['build']
            }
        },

        copy: {
            server: {
                src: ['content/**', 'core/**', './*.*', '!core/client/css/**', '!core/client/js/**'],
                dest: 'build',
                expand: true
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            build: {
                files: {
                    'build/core/client/js/panda.min.js': ['core/client/js/app/*.js']
                }
            },
            vendors: {
                banner: '\n',
                files: {
                    'build/core/client/js/vendors.min.js': [
                        'core/client/js/lib/underscore/underscore-1.6.0.min.js',
                        'core/client/js/lib/underscore/underscore.string-2.3.2.min.js',
                        'core/client/js/lib/bootstrap/bootstrap.min.js',
                        'core/client/js/lib/marked/marked.js',
                        'core/client/js/lib/nprogress/nprogress.js',
                        'core/client/js/lib/moment/moment-2.5.1.min.js',
                        'core/client/js/lib/codemirror/codemirror.js',
                        'core/client/js/lib/codemirror/mode/markdown/markdown.js'
                    ]
                }
            }
        },

        cssmin: {
            build: {
                files: {
                    'build/core/client/css/panda.min.css': ['core/client/css/*.css'],
                    'build/core/client/css/theme/default.min.css':['core/client/css/theme/default/*.css'],
                    'build/core/client/css/theme/flatly.min.css':['core/client/css/theme/flatly/*.css'],
                    'build/core/client/css/theme/lumen.min.css':['core/client/css/theme/lumen/*.css'],
                    'build/core/client/css/theme/simplex.min.css':['core/client/css/theme/simplex/*.css'],
                    'build/core/client/css/theme/slate.min.css':['core/client/css/theme/slate/*.css'],
                    'build/core/client/css/theme/spacelab.min.css':['core/client/css/theme/spacelab/*.css'],
                    'build/core/client/css/theme/superhero.min.css':['core/client/css/theme/superhero/*.css'],
                    'build/core/client/css/theme/united.min.css':['core/client/css/theme/united/*.css'],
                    'build/core/client/css/theme/yeti.min.css':['core/client/css/theme/yeti/*.css'],
                    'build/core/client/css/vendors.min.css': [
                        'core/client/css/**/*.css',
                        '!core/client/css/*.css',
                        '!core/client/css/theme/**/*.css'
                    ]
                }
            }
        },

        compress: {
            release: {
                options: {
                    archive: 'build/panda-v<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: 'build',
                src:['**']
//                files: [
//                    {
//                        cwd: 'build', expand:true, src:['**']
//                    }
//                ]
            }
        },

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
                    'core/client/js/app/**/*.js'
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

    grunt.registerTask(
        'validate',
        'Run code validation',
        ['jshint']
    );

    grunt.registerTask(
        'stylesheet',
        'Compile the stylesheets.',
        ['cssmin']
    );

    grunt.registerTask(
        'scripts',
        'Compiles the JavaScript files.',
        ['uglify']
    )

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory.',
        ['clean', 'copy', 'stylesheet', 'scripts']
    );

    grunt.registerTask(
        'release',
        'Compiles all of the assets and copies the files to the build directory.',
        ['build', 'compress']
    );

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
}

module.exports = gruntConfig;