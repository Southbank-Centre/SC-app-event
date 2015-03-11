'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    name: require('./bower.json').name,
    app: require('./bower.json').appPath || __dirname,
    dist: 'release'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    appConfig: appConfig,

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/**/*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
            '!<%= appConfig.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['.tmp/js/'+ appConfig.name +'.module.js', '.tmp/js/**/*.js'],
        dest: '<%= appConfig.dist %>/<%= appConfig.name %>.js'
      }
    },

    uglify: {
      dist: {
        src: ['<%= appConfig.dist %>/<%= appConfig.name %>.js'],
        dest: '<%= appConfig.dist %>/<%= appConfig.name %>.min.js'
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= appConfig.dist %>',
          src: [appConfig.app + '/*.html', appConfig.app + '/**/*.html'],
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>',
          src: ['**/*.js'],
          dest: '.tmp/js'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= appConfig.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appConfig.app %>',
          dest: '<%= appConfig.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '**/*.{html,txt}'
          ]
        }, {
          expand: true,
          cwd: 'assets',
          dest: '<%= appConfig.dist %>/assets',
          src: ['**/*']
        }]
      }
    }

  });

  grunt.registerTask('build', 'Build the app for distribution', function(target) {

    if (!target) {
      target = 'dist';
    }

    grunt.task.run([
      'newer:jshint',
      'clean:' + target,
      'ngAnnotate',
      'copy:' + target,
      'cdnify',
      'concat',
      'uglify',
      'htmlmin'
    ]);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);
};
