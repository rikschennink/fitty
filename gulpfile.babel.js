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
 * Copyright (c) ${ new Date().getFullYear() } ${ pkg.author.name } - ${ pkg.homepage }
 */
`;

gulp.task('default', () =>
	gulp.src('src/fitty.js')
		.pipe(babel({
			plugins: [
				'add-module-exports',
				'transform-object-rest-spread',
				'transform-es2015-modules-umd'
			],
			presets: ['es2015']
		}))
		.pipe(header(banner, { pkg }))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename('fitty.min.js'))
		.pipe(size({
			title:'Fitty',
			gzip:true
		}))
		.pipe(gulp.dest('dist'))
);
