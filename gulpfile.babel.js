import gulp from 'gulp';
import header from 'gulp-header';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import size from 'gulp-size';

const pkg = require('./package.json');
const banner =
`/*
 * ${ pkg.name } v${ pkg.version } - ${ pkg.description }
 * Copyright (c) ${ new Date().getFullYear() } ${ pkg.author }
 */
`;

gulp.task('build-node', () => {
  gulp.src('./src/fitty.js')
    .pipe(babel({
      plugins: [
        'transform-object-rest-spread'
      ],
      presets: ['es2015']
    }))
    .pipe(header(banner, { pkg }))
    .pipe(rename('fitty.module.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-web', () => {
	gulp.src('./src/fitty.js')
		.pipe(babel({
			compact:true,
			plugins: [
				'add-module-exports',
				'transform-object-rest-spread',
				'transform-es2015-modules-umd'
			],
			presets: ['es2015']
		}))
		.pipe(uglify())
		.pipe(size({ gzip:true }))
		.pipe(header(banner, { pkg }))
		.pipe(rename('fitty.min.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build-web', 'build-node']);

gulp.task('default', ['build'], () => {
	gulp.watch('./src/fitty.js', ['build']);
});