
function gruntConfig (grunt) {
    var config = {
        dir: {
            build: 'build',
            dest: {
                client: '<%= dir.build %>/core/client',
                css: '<%= dir.dest.client %>/css',
                theme: '<%= dir.dest.css %>/theme',
                js: '<%= dir.dest.client %>/js'
            },
            src: {
                client: 'core/client',
                css: '<%= dir.src.client %>/css',
                theme: '<%= dir.src.css %>/theme',
                js: '<%= dir.src.client %>/js',
                jslib: '<%= dir.src.js %>/lib'
            }
        },
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: {
                src: ['build']
            }
        },

        copy: {
            // Copy 'content' file tree
            content: {
                src: [ 'content/**' ],
                dest: '<%= dir.build %>/',
                expand: true
            },
            // Copy static resources from core/client tree; JS and CSS will be processed in a different task
            client: {
                src: [ 'core/client/**/*.{png,gif,jpg}' ],
                dest: '<%= dir.build %>/',
                expand: true
            },
            server: {
                src: ['*.*', 'core/**', '!core/client/**', '!core/**/*.jade'],
                dest: '<%= dir.build %>/',
                expand: true
            },
            pages: {
                src: ['core/**/*.jade'],
                dest: '<%= dir.build %>/',
                expand: true
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            panda: {
                files: {
                    '<%= dir.dest.js %>/panda.min.js': ['<%= dir.src.js %>/app/*.js']
                }
            },
            vendors: {
                banner: '\n',
                files: {
                    '<%= dir.dest.js %>/vendors.min.js': [
                        '<%= dir.src.jslib %>/underscore/underscore-1.6.0.min.js',
                        '<%= dir.src.jslib %>/underscore/underscore.string-2.3.2.min.js',
                        '<%= dir.src.jslib %>/bootstrap/bootstrap.min.js',
                        '<%= dir.src.jslib %>/marked/marked.js',
                        '<%= dir.src.jslib %>/nprogress/nprogress.js',
                        '<%= dir.src.jslib %>/moment/moment-2.5.1.min.js',
                        '<%= dir.src.jslib %>/codemirror/codemirror.js',
                        '<%= dir.src.jslib %>/codemirror/mode/markdown/markdown.js'
                    ]
                }
            }
        },

        cssmin: {
            client: {
                files: {
                    '<%= dir.dest.css %>/panda.min.css': [
                        '<%= dir.src.css %>/codemirror/*.css',
                        '<%= dir.src.css %>/nprogress/*.css',
                        '<%= dir.src.css %>/*.css'
                    ]
                }
            },
            themes: {
                files: {
                    '<%= dir.dest.theme %>/default.min.css':['<%= dir.src.theme %>/default/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/flatly.min.css':['<%= dir.src.theme %>/flatly/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/lumen.min.css':['<%= dir.src.theme %>/lumen/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/simplex.min.css':['<%= dir.src.theme %>/simplex/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/slate.min.css':['<%= dir.src.theme %>/slate/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/spacelab.min.css':['<%= dir.src.theme %>/spacelab/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/superhero.min.css':['<%= dir.src.theme %>/superhero/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/united.min.css':['<%= dir.src.theme %>/united/*.css', '<%= dir.src.theme %>/*.css'],
                    '<%= dir.dest.theme %>/yeti.min.css':['<%= dir.src.theme %>/yeti/*.css', '<%= dir.src.theme %>/*.css']
                }
            },
            vendor: {
                files: {
                    '<%= dir.dest.css %>/vendors.min.css': [
                        '<%= dir.src.css %>/**/*.css',
                        '!<%= dir.src.css %>/*.css',
                        '!<%= dir.src.theme %>/**/*.css'
                    ]
                }
            }
        },

        compress: {
            release: {
                options: {
                    archive: '<%= dir.build %>/panda-v<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: 'build',
                src:['**']
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
        },

        watch: {
            themeStyles: {
                files: '<%= dir.src.theme %>/**/*.css',
                tasks: ['cssmin:themes']
            },
            clientStyles: {
                files: '<%= dir.src.css %>/*.css',
                tasks: ['cssmin:client']
            },
            clientScript: {
                files: '<%= dir.src.js %>/app/*.js',
                tasks: ['uglify:panda']
            },
            pages: {
                files: 'core/server/views/**/*.jade',
                tasks: ['copy:pages']
            },
            express: {
                files: 'core/server/**/*.js',
                tasks: [ 'copy:server', 'express:dev' ],
                options: {
                    nospawn: true
                }
            }
        },

        express: {
            options: {
                script: '<%= dir.build %>/index.js',
                output: 'Panda v<%= pkg.version %> server is running'
            },
            dev: {
                options: {
                    node_env: 'development'
                }
            }
        }
    };


    /**
     * GRUNT CONFIG
     * ========================
     */
    grunt.initConfig(config);

    // Dynamically load all npm tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    /**
     * TASKS
     * ========================
     */

    grunt.registerTask('help',
        'Outputs help information if you type `grunt help` instead of `grunt --help`',
        function () {
            console.log('Type `grunt --help` to get the details of available grunt tasks');
        }
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

    grunt.registerTask(
        'default',
        'Watches the project for changes, automatically rebuilds files and runs a server',
        ['build', 'express', 'watch']
    );
}

module.exports = gruntConfig;