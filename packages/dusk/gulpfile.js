const gulp = require('gulp');
const watch = require('gulp-watch');
const ts = require('gulp-typescript');
const merge = require('merge2');
const fs = require('fs');
const path = require('path');


// 1.观察普通文件 ( 复制 到lib目录)
const files = ['src/**/*.sass', 'src/**/*.less', 'src/**/*.json', 'src/**/*.png', 'src/**/*.jpg'];
const dest = 'lib/';

function rmdir(url) {
    if (fs.existsSync(url)) {
        fs.readdirSync(url).forEach(async (file) => {
            const newUrl = path.join(url, file);
            if (fs.statSync(newUrl).isDirectory()) { // recurse
                await rmdir(newUrl);
            } else { // delete file
                fs.unlinkSync(newUrl);
                // fs.rmSync(newUrl)
            }
        });
        fs.rmdirSync(url);
    }
}

gulp.task('clean', async () => {
    console.log(`clean ${dest}`);
    await rmdir(dest);
});

function compileOtherFile() {
    console.log('watch file');
    gulp.src(files).pipe(gulp.dest(dest))
}


gulp.task('watch:files', () => {
    compileOtherFile();
    watch(files, file => {
        compileOtherFile()
    })
});

// 2.观察ts文件 ( 编译 到lib目录)
const tsFiles = ['src/**/*.ts', 'src/**/*.tsx'];
const tsProject = ts.createProject('tsconfig.json', {
    isolatedModules: false
});
const tsp = tsProject();

function compileTs() {
    console.log('compile ts file');
    const tsResult = gulp.src(tsFiles)
        .pipe(tsp);

    return merge([
        tsResult.dts.pipe(gulp.dest(dest)),
        tsResult.js.pipe(gulp.dest(dest))
    ]);
}

gulp.task('watch:tsc', () => {
    // compileTs();
    watch(tsFiles, file => {
        compileTs();
    })
});

//
// gulp.task('copy:less', done => {
//     console.log('[Parallel] copy less to lib ...');
//     gulp.src('src/**/*.sass').pipe(gulp.dest('lib/')).on('finish', done);
// });

// gulp.task(
//     'copy:css',
//     gulp.series(gulp.parallel('copy:less'))
// );

gulp.task('watch', gulp.series(gulp.parallel('watch:files', 'watch:tsc')));

function defaultTask(cb) {
    // place code for your default task here
    cb();
}

exports.default = defaultTask;

