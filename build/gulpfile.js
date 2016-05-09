// Requis
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    pathModule = require('path'),
    git = require('git-rev'),
    runSequence = require('run-sequence'),
    fs = require('fs'),
    jsdoc = require('gulp-jsdoc'),
    browserSync = require('browser-sync'),
    browserify = require('browserify'),
    reload = browserSync.reload,
    source = require('vinyl-source-stream');
    
var pkg = { revision : '',
            timeStamp : '',
            licence : ''};

var comment = '<%= pkg.licence %>\n\n/* Last build : <%= pkg.timeStamp %> / git revision : <%= pkg.revision %> */\n\n';

var config = {
    NAME: "AdsPlayer",
    UMD : "umd.js",
    JS: ['../src/**/*.js'],
    MINIFIED_OUT: 'adsplayer.min.js',
    CONCAT_OUT: 'adsplayer.js',
    DEST: '../dist',
    LICENCE : '../LICENSE',
    DOC : {
        dir: '../dist/doc/',
        template:'node_modules/gulp-jsdoc/node_modules/ink-docstrap/template',
        readMe:'../README.md',
        fileSource:'../src/AdsPlayer.js'
    }
};


/*** UMD TEST ****/
gulp.task('umdTest_serve', function() {
    browserSync({
        notify: false,
        server: config.DEST
    });
    gulp.watch([config.DEST+'**/*'], reload);
});

gulp.task('umdTest_copy_index', function() {
    return gulp.src(['./UMD_test/index.html'])
    .pipe(gulp.dest(config.DEST));
});

gulp.task('umdTest_build', function() {
    return browserify({ entries: ['./UMD_test/browserify_test.js'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(config.DEST));
});

gulp.task('umd_test', function() {
    runSequence('clean',['lint', 'gitRev'],'compress',['umdTest_copy_index', 'umdTest_build'],'umdTest_serve');
});

/*** UMD TEST ****/
 
gulp.task('lint', function() {
    return gulp.src(config.JS)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});
 
 gulp.task('gitRev', function() {
    git.short(function (str) {
        pkg.revision = str;
    });
    fs.readFile(config.LICENCE, null, function(err, _data) {
        console.log('read licence file ');
        pkg.licence = _data;
    });
    pkg.timeStamp = new Date().getDate()+"."+(new Date().getMonth()+1)+"."+(new Date().getFullYear())+"_"+(new Date().getHours())+":"+(new Date().getMinutes())+":"+(new Date().getSeconds());
 });
 
gulp.task('compress', function() {
    return gulp.src(config.JS)
    .pipe($.concat(config.CONCAT_OUT))
    .pipe($.umd({
        namespace:function(){
            return config.NAME;
        },
        template:pathModule.join(__dirname, config.UMD)
    }))
    .pipe(gulp.dest(config.DEST))
    .pipe($.uglify())
    .pipe($.banner(comment, {
        pkg: pkg
    }))
    .pipe($.rename(config.MINIFIED_OUT))
    .pipe(gulp.dest(config.DEST));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, [config.DEST], {
    dot: true,
    force: true
}));

gulp.task('doc', function() {
    return gulp.src([config.DOC.fileSource/*, config.DOC.readMe*/])
    .pipe(jsdoc(config.DOC.dir, {
        path:config.DOC.template,
        'theme': 'united',
        'linenums': true,
        'navType': 'vertical'
    }))
    .pipe(gulp.dest(config.DOC.dir));
});

gulp.task('build', function() {
    runSequence('clean',['lint', 'gitRev'],'compress');
});