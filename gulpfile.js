// see also... https://www.npmjs.com/package/electron-connect

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

var static_files = ['static/js/*.js', 'static/*.html'];
var src_files = ['src/*.js'];

gulp.task('serve', function () {
  electron.start();
  gulp.watch(src_files, electron.restart);
  gulp.watch(static_files, electron.reload);
});

gulp.task('default', ['serve']);
