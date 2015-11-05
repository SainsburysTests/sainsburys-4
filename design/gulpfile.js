'use strict';

var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-ruby-sass'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	eventstream = require('event-stream');

var task = {};

// Sass code
gulp.task('styles', task.styles = function () {
	return eventstream.concat(
		sass('./resources/sass/sainsburys.scss', {
			//style: 'expanded',
			style: 'compressed',
			noCache: true
		})
			.pipe(autoprefixer(["last 1 version", "> 1%", "ie 8"], {cascade: true}))
			.pipe(concat('style.css'))
			.pipe(gulp.dest('./assets/css'))
	);
});

// Css Libraries
gulp.task('libraries', task.libraries = function () {
	return eventstream.concat(
		gulp.src(['resources/sass/libraries/**/*.css'])
			.pipe(concat('libs.css'))
			.pipe(gulp.dest('./assets/css'))
	);
});

// Watch for changes in source files
gulp.task('watch', function () {
	// Watch for changes in source files
	gulp.watch('resources/sass/**/*.scss', ['styles', 'libraries']);
	gulp.watch('gulpfile.js', ['js']);
});

// The default task
gulp.task('default', ['styles', 'libraries']);