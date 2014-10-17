# [gulp](http://gulpjs.com)-save [![Build Status](https://travis-ci.org/danielhusar/gulp-save.svg?branch=master)](https://travis-ci.org/danielhusar/gulp-save)

> Store and restore files in stream.


## Install

```sh
$ npm install --save-dev gulp-save
```


## Usage

```js
var gulp = require('gulp');
var save = require('gulp-save');
var uglify = require('gulp-uglify');

gulp.task('default', function () {
	return gulp.src('src/*.js')
		.pipe(save('before-uglify')) //cache all files here
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
		.pipe(save.restore('before-uglify')) //restore all files to the state when we cached them
		.pipe(gulp.dest('dist'));

});
```


## API

### save(cache)

####cache

Type: `string`  
Default: ``

Key where the stream will be cached.

### save.restore(cache)

####cache

Type: `string`  
Default: ``

Key from where stream should be restored.


## License

MIT © [Daniel Husar](https://github.com/danielhusar)
