var gulp = require('gulp'),
    // node packages
    del = require('del'),
    fs = require('fs'),
    runSequence = require('run-sequence'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    merge = require('utils-merge'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    // gulp packages
    footer = require('gulp-footer'),
    header = require('gulp-header'),
    git = require('gulp-git'),
    gulpif = require('gulp-if'),
    jsdoc = require('gulp-jsdoc'),
    jshint = require('gulp-jshint'),
    //rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    // custom import
    pkg = require('./package.json');


var config = {
    name: "AdsPlayer",
    distDir: './dist',
    doc: {
        dir: './dist/doc/',
        template: './node_modules/gulp-jsdoc/node_modules/ink-docstrap/template',
        readMe: './README.md',
        fileSource: './src/AdsPlayer.js'
    }
};

var moduleFilename = './index.js';

var browserifyAgs = {
    entries: moduleFilename,
    transform: [['babelify', { 'presets': ['es2015'] }]],
    debug: true
};

var sources = [
    "./src/AdsPlayer.js",
    "./src/**/*.js"
];

var banner = ['<%= pkg.copyright %>\n\n/* Last build : <%= pkg.gitDate %>_<%= pkg.gitTime %> / git revision : <%= pkg.gitRevision %> */\n\n'].join('\n');

var jshint_ignore_start = '/* jshint ignore:start */\n';
var jshint_ignore_end = '\n/* jshint ignore:end */';


gulp.task('clean', function(done) {
    return (function() {
        del([config.distDir + '**/*'], {
            force: true,
            dot: true
        });
        done();
    })();
});

gulp.task('clean-temp', function(done) {
    return (function() {
        del([config.distDir + 'temp/*'], {
            force: true,
            dot: true
        });
        done();
    })();
});

gulp.task('gitRevision', function() {
    // Get last abbreviated commit hash
    git.exec({args: 'log -1 --format=%h', quiet: true}, function (err, stdout) {
        pkg.gitRevision = stdout.replace(/(\r\n|\n|\r)/gm,"");
    });
});

gulp.task('gitDate', function() {
    // Get last commit date
    git.exec({args: 'log -1 --format=%cD', quiet: true}, function (err, stdout) {
        var date = new Date(stdout);
        pkg.gitDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        pkg.gitTime = (date.getHours()) + ':' + (date.getMinutes()) + ':' + (date.getSeconds());
    });
});

gulp.task('copyright', function() {
    // Get copyright
    fs.readFile('./COPYRIGHT', null, function(err, _data) {
        pkg.copyright = _data;
    });
});

gulp.task('package-info', function() {
    runSequence('gitRevision', 'gitDate', 'copyright');
});

gulp.task('lint', function() {
    return gulp.src(sources)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


function bundle_js(bundler, name, build) {
    return bundler.bundle()
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulpif(build, replace(/VERSION[\s*]=[\s*]['\\](.*)['\\]/g, 'VERSION = \'' + pkg.version + '\'')))
        .pipe(gulpif(build, replace(/@@TIMESTAMP/, pkg.gitDate + '_' + pkg.gitTime)))
        .pipe(gulpif(build, replace(/@@REVISION/, pkg.gitRevision)))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpif(build, uglify()))
        .pipe(gulpif(build, header(jshint_ignore_start)))
        .pipe(gulpif(build, footer(jshint_ignore_end)))
        .pipe(gulpif(build, header(banner, { pkg : pkg })))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.distDir));
}

gulp.task('watch', function () {
    var args = merge(watchify.args, browserifyAgs),
        bundler = watchify(browserify(args));

    bundler.on('error', function (error) {
        console.log(error);
        this.end();
    });

    bundler.on('update', function () {
        bundle_js(bundler, pkg.name, false);
    });

    bundle_js(bundler, pkg.name, false);
});

gulp.task('build', ['clean', 'package-info', 'lint'], function() {

    return bundle_js(browserify(browserifyAgs), pkg.name, true);
});

gulp.task('releases-notes', function() {
    return gulp.src('./RELEASES NOTES.txt')
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
