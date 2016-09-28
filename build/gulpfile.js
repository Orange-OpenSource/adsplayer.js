var gulp = require('gulp'),
    // node packages
    del = require('del'),
    fs = require('fs'),
    path = require('path'),
    runSequence = require('run-sequence'),
    // gulp packages
    banner = require('gulp-banner'),
    concat = require('gulp-concat'),
    footer = require('gulp-footer'),
    git = require('gulp-git'),
    jsdoc = require('gulp-jsdoc'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    umd = require('gulp-umd'),
    zip = require('gulp-zip'),
    // custom import
    pkg = require('../package.json'),
    sources = require('./sources.json');

var comment = '<%= pkg.copyright %>\n\n/* Last build : <%= pkg.gitDate %>_<%= pkg.gitTime %> / git revision : <%= pkg.gitRevision %> */\n\n';

var jshint_ignore_start = '/* jshint ignore:start */\n';
var jshint_ignore_end = '\n/* jshint ignore:end */';

var config = {
    name: "AdsPlayer",
    distDir: '../dist',
    doc: {
        dir: '../dist/doc/',
        template: '../node_modules/gulp-jsdoc/node_modules/ink-docstrap/template',
        readMe: '../README.md',
        fileSource: '../src/AdsPlayer.js'
    }
};

var sourcesGlob = sources.default;

gulp.task('package-info', function() {
    // Get last abbreviated commit hash
    git.exec({args: 'log -1 --format=%h', quiet: true}, function (err, stdout) {
        pkg.gitRevision = stdout.replace(/(\r\n|\n|\r)/gm,"");
    });
    // Get last commit date
    git.exec({args: 'log -1 --format=%cD', quiet: true}, function (err, stdout) {
        var date = new Date(stdout);
        pkg.gitDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        pkg.gitTime = (date.getHours()) + ':' + (date.getMinutes()) + ':' + (date.getSeconds());
    });
    fs.readFile('../COPYRIGHT', null, function(err, _data) {
        pkg.copyright = _data;
    });

});

gulp.task('lint', function() {
    return gulp.src(sourcesGlob)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['clean', 'package-info', 'lint'], function() {
    sourcesGlob = sources.libs.concat(sourcesGlob);
    return gulp.src(sourcesGlob)
        .pipe(concat(pkg.name))
        .pipe(umd({
            namespace: function() {
                return config.name;
            },
            template: path.join(__dirname, 'umd.js')
        }))
        .pipe(replace(/VERSION[\s*]=[\s*]['\\](.*)['\\]/g, 'VERSION = \'' + pkg.version + '\''))
        .pipe(replace(/@@TIMESTAMP/, pkg.gitDate + '_' + pkg.gitTime))
        .pipe(replace(/@@REVISION/, pkg.gitRevision))
        .pipe(banner(comment, {
            pkg: pkg
        }))
        .pipe(gulp.dest(config.distDir))
        .pipe(uglify())
        .pipe(banner(jshint_ignore_start))
        .pipe(footer(jshint_ignore_end))
        .pipe(banner(comment, {
            pkg: pkg
        }))
        .pipe(rename(pkg.name.replace('.js', '.min.js')))
        .pipe(gulp.dest(config.distDir));
});

gulp.task('clean', function(done) {
    return (function() {
        del([config.distDir + '**/*'], {
            force: true,
            dot: true
        });
        done();
    })();
});

gulp.task('releases-notes', function() {
    return gulp.src('../RELEASES NOTES.txt')
        .pipe(gulp.dest(config.distDir));
});

gulp.task('zip', function() {
    return gulp.src(config.distDir + '/**/*')
        .pipe(zip(pkg.name + '.zip'))
        .pipe(gulp.dest(config.distDir));
});

gulp.task('doc', function() {
    return gulp.src([config.doc.fileSource, config.doc.readMe])
        .pipe(jsdoc(config.doc.dir, {
            path: config.doc.template,
            'theme': 'united',
            'linenums': true,
            'navType': 'vertical'
        }))
        .pipe(gulp.dest(config.doc.dir));
});

gulp.task('version', function() {
    fs.writeFileSync(config.distDir + '/version.properties', 'VERSION=' + pkg.version);
});

gulp.task("default", function(cb) {
    runSequence('build', ['doc'],
        'releases-notes',
        'zip',
        'version',
        cb);
});
