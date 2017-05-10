module.exports = function(grunt) {

  grunt.template.addDelimiters('square', '[%', '%]');
  // ----------
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-githooks');

  // ----------
  var distribution = 'mirador/mirador.js',
  minified = 'mirador/mirador.min.js',
  releaseRoot = '../site-build/built-mirador/',

  // libraries/plugins
  vendors = [
    'js/lib/jquery.min.js',
    'js/lib/jquery.hasClassRegEx.js',
    'js/lib/jquery-ui.min.js',
    'js/lib/jquery-ui.drag-multiple.js',
    'js/lib/jquery-migrate-3.0.0.min.js',
    'js/lib/modal.js',
    'js/lib/bootbox.js',
    'js/lib/jquery.scrollTo.min.js',
    'js/lib/jquery.qtip.min.js',
    'js/lib/state-machine.min.js',
    'js/lib/tinymce.min.js',
    'js/lib/handlebars.js',
    //'js/lib/openseadragon.min.js',
    'js/lib/openseadragon.js',
    'js/lib/openseadragon-scalebar.js',
    'js/lib/d3.v3.min.js',
    'js/lib/pubsub.min.js',
    'js/lib/URI.min.js',
    'js/lib/mousetrap.min.js',
    'js/lib/isfahan.js',
    'js/lib/paper-core.min.js',
    'js/lib/spectrum.js',
    'js/lib/underscore-min.js',
    'js/lib/i18next.min.js',
    'js/lib/i18nextBrowserLanguageDetector.min.js',
    'js/lib/i18nextXHRBackend.min.js',
    'js/lib/modernizr.custom.js',
    'js/lib/sanitize-html.min.js'
  ],

  // source files
  sources = [
    'js/src/mirador.js', 
    'js/src/utils/handlebars.js',
    'js/src/*.js',
    'js/src/viewer/*.js',
    'js/src/manifests/*.js',
    'js/src/annotations/*.js',
    'js/src/workspaces/*.js',
    'js/src/widgets/*.js',
    'js/src/utils/*.js'
  ];

  // ----------
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['mirador'],
      release: {
        src: [releaseRoot],
        options: {
          force: true
        }
      }
    },

    concat: {
      js: {
        options: {
          banner: '//! [%= pkg.name %> <%= pkg.version %]\n' + '//! Built on [%= grunt.template.today("yyyy-mm-dd") %]\n',
          process: {
            delimiters: 'square'
          }
        },
        src:  [ "<banner>" ].concat(vendors, sources),
        dest: distribution
      },
      css: {
        src: [
          'css/bootstrap.modals.css',
          'css/normalize.css',
          'css/font-awesome.min.css',
          'css/jquery-ui.min.css',
          'css/jquery.qtip.min.css',
          'css/spectrum.css',
          'css/mirador.css',
          'css/material-icons.css'
        ],
        dest: 'mirador/css/mirador-combined.css'
      }
    },

    cssmin: {
      minify: {
        src: 'mirador/css/mirador-combined.css',
        dest: 'mirador/css/mirador-combined.min.css'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some',
        mangle: false,
        sourceMap: true
      },
      mirador: {
        src: [vendors, sources],
        dest: minified
      }
    },

    copy: {
      main: {
        files: [{
          expand: true,
          src: 'css/images/**',
          dest: 'mirador/'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'themes/**',
          dest: 'mirador'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'skins/**',
          dest: 'mirador'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'plugins/**',
          dest: 'mirador'
        }, {
          expand: true,
          src: 'images/**',
          dest: 'mirador'
        }, {
          expand: true,
          src: 'fonts/*',
          dest: 'mirador'
        }, {
          src: 'js/lib/parse.min.js',
          dest: 'mirador/parse.min.js'
        }, {
          src: 'js/lib/ZeroClipboard.swf',
          dest: 'mirador/ZeroClipboard.swf'
        }, {
          expand: true,
          src: 'locales/**',
          dest: 'mirador'
        }]
      }
    },

    compress: {
      zip: {
        options: {
          archive: 'mirador.zip'
        },
        files: [
          { expand: true, cwd: 'mirador/', src: ['**'] }
        ]
      },
      tar: {
        options: {
          archive: 'mirador.tar'
        },
        files: [
          { expand: true, cwd: 'mirador/', src: [ '**' ] }
        ]
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    },

    watch: {
      all: {
        options: {
          livereload: {
            // Here we watch the files the sass task will compile to
            // These files are sent to the live reload server after sass compiles to them
            options: { livereload: true },
            files: ['**/*']
          }
        },
        files: [
          'Gruntfile.js',
          'js/src/*.js',
          'js/src/*/*.js',
          'locales/*/*.json',
          'images/*',
          'css/*.css',
          'index.html'
        ],
        tasks: 'dev_build'
      }
    },

    jshint: {
      options: {
        browser: true,
        eqeqeq: false,
        loopfunc: false,
        indent: false,
        jshintrc: '.jshintrc',
        globals: {
          Mirador: true
        }
      },
      beforeconcat: sources
    },

    'git-describe': {
      build: {
        options: {
          prop: 'gitInfo'
        }
      }
    },

    coveralls: {
      options: {
        src: 'reports/coverage/PhantomJS*/lcov.info',
        force: 'true'
      },
      ci: {
        src: 'reports/coverage/PhantomJS*/lcov.info'
      }
    }
  });

  // ----------
  // Copy:release task.
  // Copies the contents of the build folder into the release folder.
  grunt.registerTask('copy:release', function() {
    grunt.file.recurse('mirador', function(abspath, rootdir, subdir, filename) {
      var dest = releaseRoot +
        (subdir ? subdir + '/' : '/') +
        filename;

      grunt.file.copy(abspath, dest);
    });
  });

  // ----------
  // Build task.
  // Cleans out the build folder and builds the code and images into it, checking lint.
  grunt.registerTask('build', [ 'clean:build', 'git-describe', 'jshint', 'concat:css', 'uglify', 'cssmin', 'copy']);

  // ----------
  // Dev Build task.
  // Build, but skip the time-consuming and obscurantist minification and uglification.
  grunt.registerTask('dev_build', [ 'clean:build', 'git-describe', 'jshint', 'concat', 'copy']);

  // ----------
  // Package task.
  // Builds and creates the .zip and .tar files.
  grunt.registerTask('package', ['build', 'compress']);

  // ----------
  // Publish task.
  // Cleans the built files out of the release folder and copies newly built ones over.
  grunt.registerTask('publish', ['package', 'clean:release', 'copy:release']);

  // ----------
  // Default task.
  // Does a normal build.
  grunt.registerTask('default', ['build']);

  // ----------
  // Connect task.
  // Runs server at specified port
  grunt.registerTask('serve', ['dev_build', 'connect:server', 'watch']);

  // ----------
  // Runs this on travis.
  grunt.registerTask('ci', [
                     'jshint'
  ]);
};
