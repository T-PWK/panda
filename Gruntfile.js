
function gruntConfig (grunt) {
    var config = {
        dir: {
            build: 'build',
            dest: {
                client: '<%= dir.build %>/core/client',
                css: '<%= dir.dest.client %>/css',
                theme: '<%= dir.dest.css %>/theme',
                js: '<%= dir.dest.client %>/js',
                views: '<%= dir.build %>/core/server/views'
            },
            src: {
                client: 'core/client',
                css: '<%= dir.src.client %>/css',
                theme: '<%= dir.src.css %>/theme',
                js: '<%= dir.src.client %>/js',
                jslib: '<%= dir.src.js %>/lib',
                views: 'core/server/views'
            }
        },
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            all: {
                src: ['build']
            },
            js: {
                src: [ '<%= dir.dest.js %>/*.js' ]
            }
        },

        copy: {
            // Copy 'content' file tree
            content: {
                src: [ 'content/**', '!content/themes/**', 'content/themes/casper/**'  ],
                dest: '<%= dir.build %>/',
                expand: true
            },
            siteThemes: {
                src: [ 'content/themes/**' ],
                dest: '<%= dir.build %>/',
                expand: true
            },
            config: {
                src: [ 'config.json' ],
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
                src: ['*.*', '!config.json', 'core/**', '!core/client/**', '!core/**/*.jade'],
                dest: '<%= dir.build %>/',
                expand: true
            },
            pages: {
                src: ['core/**/*.jade'],
                dest: '<%= dir.build %>/',
                expand: true
            }
        },

        hashres: {
            options: {
                encoding: 'utf8',
                fileNameFormat: '${name}.${hash}.${ext}',
                renameFiles: true
            },
            images: {
                options: {},
                src: [
                    '<%= dir.dest.client %>/**/*.{png,jpg,gif}'
                ],
                dest: ['<%= dir.dest.views %>/admin/{login,index}.jade']
            },
            css: {
                options: {},
                src: [
                    '<%= dir.dest.css %>/*.css',
                    '<%= dir.dest.theme %>/*.css'
                ],
                dest: ['<%= dir.dest.views %>/admin/layout.jade']
            },
            js: {
                options: {},
                src: [
                    '<%= dir.dest.js %>/*.js'
                ],
                dest: ['<%= dir.dest.views %>/admin/index.jade']
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            client: {
                files: {
                    '<%= dir.dest.js %>/panda.min.js': ['<%= dir.src.js %>/app/*.js']
                }
            },
            vendors: {
                banner: '\n',
                files: {
                    '<%= dir.dest.js %>/vendors.min.js': [
                        '<%= dir.src.jslib %>/lodash/lodash.min.js',
                        '<%= dir.src.jslib %>/underscore/underscore.string-2.3.2.min.js',
                        '<%= dir.src.jslib %>/bootstrap/bootstrap.min.js',
                        '<%= dir.src.jslib %>/ui.bootstrap/ui-bootstrap-tpls-0.10.0.min.js',
                        '<%= dir.src.jslib %>/angularFileUpload/angular-file-upload.js',
                        '<%= dir.src.jslib %>/marked/marked.js',
                        '<%= dir.src.jslib %>/nprogress/nprogress.js',
                        '<%= dir.src.jslib %>/moment/moment-2.5.1.min.js',
                        '<%= dir.src.jslib %>/codemirror/codemirror.js',
                        '<%= dir.src.jslib %>/codemirror/mode/markdown/markdown.js',
                        '<%= dir.src.jslib %>/codemirror/addon/commands.js'
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
                    'core/client/js/app/**/*.js',
                    '!core/client/js/app/angular-file-upload.js'
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
                tasks: ['uglify:client']
            },
            pages: {
                files: '<%= dir.src.views %>/**/*.jade',
                tasks: ['copy:pages']
            },
            express: {
                files: 'core/server/**/*.js',
                tasks: [ 'copy:server', 'express:dev' ],
                options: {
                    nospawn: true
                }
            },
            siteThemes: {
                files: 'content/themes/**',
                tasks: [ 'copy:siteThemes' ]
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
    grunt.config.init(config);

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
    );

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory.',
        [
            'clean:all',
            'copy:content',
            'copy:client',
            'copy:server',
            'copy:pages',
            'stylesheet',
            'scripts'
        ]
    );

    grunt.registerTask(
        'release',
        'Compiles all of the assets and copies the files to the build directory.',
        [
            'jshint',
            'build',
            'hashres',
            'compress'
        ]
    );

    grunt.registerTask(
        'default',
        'Watches the project for changes, automatically rebuilds files and runs a server',
        [
            'build',
            'copy:siteThemes',
            'copy:config',
            'express',
            'watch'
        ]
    );
}

module.exports = gruntConfig;