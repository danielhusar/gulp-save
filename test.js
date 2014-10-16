'use strict';
var assert = require('assert');
var through = require('through2');
var gutil = require('gulp-util');
var save = require('./');

function transform () {
	return through.obj(function (file, enc, cb) {
		file.contents = new Buffer('sample content');
		this.push(file);
		cb();
	});
}

it('should cache stream and restore it', function (cb) {
	var startCache = save('test');
	var testTransform = transform();
	var restoreCache = save.restore('test');

	startCache.pipe(testTransform).pipe(restoreCache);

	restoreCache.on('data', function (file) {
		console.log('a');
		assert.equal(file.contents.toString(), 'unicorns');
	});

	testTransform.on('end', cb);

	startCache.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startCache.end();
});
