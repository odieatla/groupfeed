const gulp = require('gulp');
const spawn = require('child_process').spawn;
const jshint = require('gulp-jshint');
const autoprefix = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');

var node;
//const browserSync = require('browser-sync');
//const reload = browserSync.reload;

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', () => {
  if (node) node.kill();
  node = spawn('node', ['app.js'], {stdio: 'inherit'});
  node.on('close', (code) => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

// jshint task -- check js code quality
gulp.task('jshint', () => {
  gulp.src('./src/server/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// styles

// build
gulp.task('build', ['jshint']);

gulp.task('default', ['build'], () => {
  gulp.run('server');

  // watch run server
  gulp.watch(['./app.js', './src/server/**/*.js'], () => {
    gulp.run('build');
    gulp.run('server');
  });

});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
});
