const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const htmlMin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const less = require('gulp-less');
const cssSpriter = require('gulp-css-spriter');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const jsuglify = require('gulp-uglify');
const base64 = require('gulp-base64');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');




let buildPath = {
    index_path: './build/',
    html_path: './build/html/',
    image_path: './build/image/',
    css_path: './build/css/',
    js_path: './build/js/'

};

let srcPath = {
    entry: {
       index_path: './src/*.html',
       html_path: './src/html/*.html',
       image_path: './src/image/*.*',
       less_path: './src/less/*.less',
       css_path: './src/css/*.css',
       js_path: './src/js/*.js',
    },
    output: {
        index_path: './src/',
        html_path: './src/html/',
        image_path: './src/image/',
        css_path: './src/css/',
        less_path: './src/less/',
        js_path: './src/js/',
    }
};

let serverConfig = {
    root: './src/',
    port: 8080
};



//------------------开发模式---------------
//src/*.html
gulp.task('reloadIndex', () => {
    gulp.src(`${ srcPath.entry.index_path }`)
        .pipe(gulp.dest(`${ srcPath.output.index_path }`))
        .pipe(reload({
            stream: true
        }))
});


//src/html/*.html
gulp.task('reloadHtml', () => {
    gulp.src(`${ srcPath.entry.html_path }`)
        .pipe(gulp.dest(`${ srcPath.output.html_path }`))
        .pipe(reload({
            stream: true
        }))
});

//src/less/*.less
gulp.task('less', () => {
    gulp.src(`${ srcPath.entry.less_path }`)
        .pipe(less())
        .pipe(gulp.dest(`${ srcPath.output.css_path }`))
        .pipe(reload({
            stream: true
        }))
});

//src/css/*.css
gulp.task('css', () => {
    gulp.src(`${ srcPath.entry.css_path }`)
        .pipe(cssSpriter({
            'spriteSheet': './src/sprite/spritesheet.png', //生成大图的存储路径
            'pathToSpriteSheetFromCSS': '../sprite/spritesheet.png' //在css中雪碧图替换的路径名称
        }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(`${ srcPath.output.css_path }`))
        .pipe(reload({
            stream: true
        }))
});

//src/js/*.js
gulp.task('js', () => {
    gulp.src(`${ srcPath.entry.js_path }`)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(babel())
        .pipe(gulp.dest(`${ srcPath.output.js_path }`))
        .pipe(reload({
            stream: true
        }))
});

//server
gulp.task('server', async () => {
    browserSync.init({
        server: {
            baseDir: './',
            index: './src/index.html'
        },
        port: 8080
    });

    gulp.watch(`${ srcPath.entry.index_path.replace('./', '')}`, ['reloadIndex']);
    gulp.watch(`${ srcPath.entry.html_path.replace('./', '')}`, ['reloadHtml']);
     gulp.watch(`${ srcPath.entry.less_path.replace('./', '')}`, ['less']);
    gulp.watch(`${ srcPath.entry.css_path.replace('./', '')}`, ['css']);
    gulp.watch(`${ srcPath.entry.js_path.replace('./', '')}`, ['js']);
});


//启动开发环境
gulp.task('default', ['server']);



//------------------生产模式----------------
//压缩图片
gulp.task('imageMin', () => {
    return gulp.src(`${ srcPath.entry.image_path }`)
        .pipe(imagemin())
        .pipe(gulp.dest(`${ buildPath.image_path }`))
});

//压缩html
gulp.task('htmlMin', () => {
    return gulp.src(`${ srcPath.output.index_path }*.html`)
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(gulp.dest(`${ buildPath.index_path }`))
});

gulp.task('html_min', () => {
    return gulp.src(`${ srcPath.output.html_path }*.html`)
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(rev())
        .pipe(gulp.dest(`${ buildPath.html_path }`))
        .pipe(rev.manifest())
        .pipe(gulp.dest(`${ buildPath.html_path }`))
});


//压缩css
gulp.task('cssMin', () => {
    return gulp.src(`${ srcPath.output.css_path }`)
        .pipe(base64({maxImageSize: 8*1024 }))  //设置最大的图片为8kb
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(rev())
        .pipe(gulp.dest(`${ buildPath.css_path }`))
        .pipe(rev.manifest())
        .pipe(gulp.dest(`${ buildPath.css_path }`))
});

gulp.task('cssRev', () => {
    return gulp.src([`${ buildPath.css_path }*.json`, `${ buildPath.html_path }*.html`])
        .pipe(revCollector({}))
        .pipe(gulp.dest(`${ buildPath.css_path }`))
});

//压缩js文件
gulp.task('jsMin', () => {
    return gulp.src(`${ srcPath.output.js_path }`)
        .pipe(jsuglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(rev())
        .pipe(gulp.dest(`${ buildPath.js_path }`))
        .pipe(rev.manifest())
        .pipe(gulp.dest(`${ buildPath.js_path }`))
});

gulp.task('jsRev', () => {
    return gulp.src([`${ buildPath.js_path }*.json`, `${ buildPath.html_path }*.html`])
        .pipe(revCollector({}))
        .pipe(gulp.dest(`${ buildPath.js_path }`))
});

//启动生产环境
gulp.task('build',  ['htmlMin', 'html_min', 'imageMin', 'cssMin', 'jsMin']);



