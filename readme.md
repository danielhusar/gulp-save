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
		.pipe(save('before-uglify', opts)) //cache all files here
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
		.pipe(save.restore('before-uglify')) //restore all files to the state when we cached them
		.pipe(gulp.dest('dist'));

});
```


## API

### save(cache, opts)

####cache

Type: `string`  
Default: ``

Key where the stream will be cached.

####opts
Same as [vinyl clone options](https://github.com/wearefractal/vinyl#cloneopt)

### save.restore(cache)

####cache

Type: `string`  
Default: ``

Key from where stream should be restored.

### save.clear(cache, cache, ...)

####cache

Type: `string`  
Default: ``

Cache item to clear.
If `save.clear` is called with no parameters, it will clear the whole cache. 


## License

MIT © [Daniel Husar](https://github.com/danielhusar)
