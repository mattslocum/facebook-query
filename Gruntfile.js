module.exports = function(grunt) {
    grunt.initConfig({
        karma: {
            unit: {
                options: {
                    frameworks: [
                        "jasmine"
                    ],
                    plugins: [
                        'karma-junit-reporter',
                        'karma-phantomjs-launcher',
                        'karma-jasmine'
                    ],
                    files: [
                        'src/facebook.query.js',
                        'test/**/*.js'
                    ],
                    browsers: ['PhantomJS'],
                    logLevel: 'INFO', //DEBUG
                    background: false
                }
            }
        },
        // maybe instead, use https://github.com/dcodeIO/grunt-closurecompiler
        uglify: {
            my_target: {
                options: {
                    mangle: {
                        toplevel: false
                    },
                    'mangle-toplevel': true, // isn't working, maybe figure_out_scope?
                    compress: true
                },
                files: {
                    'src/facebook.query.min.js': ['src/facebook.query.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-uglify');
};
