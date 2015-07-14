'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var through = require('through2');
var save = require('./');

var foo = {
	bar: {
		baz: true
	}
};

function start () {
	return through.obj(function (file, enc, cb) {
		file.custom = foo;
		this.push(file);
		cb();
	});
}

function transform () {
	return through.obj(function (file, enc, cb) {
		file.contents = new Buffer('two unicorns');
		this.push(file);
		cb();
	});
}

function end () {
	return through.obj(function (file, enc, cb) {
		this.push(file);
		cb();
	});
}

it('should cache stream and restore it', function (cb) {
	var startStream = start();
	var startCache = save('test');
	var transformStream = transform();
	var restoreCache = save.restore('test');
	var endStream = end();


	startStream.pipe(startCache)
			 .pipe(transformStream)
			 .pipe(restoreCache)
			 .pipe(endStream);

	transformStream.on('data', function (file) {
		assert.equal(file.contents.toString(), 'two unicorns');
		assert.equal(file.custom.bar.baz, true);
	});

	endStream.on('data', function (file) {
		assert.equal(file.contents.toString(), 'unicorns');
		assert.equal(file.custom.bar.baz, true);
	});

	endStream.on('end', cb);

	startStream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startStream.end();
});

it('should cache stream and restore it with custom options', function (cb) {
	var startStream = start();
	var startCache = save('test', {deep: true});
	var transformStream = transform();
	var endStream = end();
	var restoreCache = save.restore('test');

	startStream.pipe(startCache)
			 .pipe(transformStream)
			 .pipe(restoreCache)
			 .pipe(endStream);

	transformStream.on('data', function (file) {
		assert.equal(file.contents.toString(), 'two unicorns');
		assert.equal(file.custom.bar.baz, true);
	});

	endStream.on('data', function (file) {
		assert.equal(file.contents.toString(), 'unicorns');
		foo.bar.baz = false;
		assert.equal(file.custom.bar.baz, true);
	});

	endStream.on('end', cb);

	startStream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startStream.end();
});

it('should emit error when store is not found', function (cb) {
	var startStream = start();
	var startCache = save('foo');
	var transformStream = transform();
	var endStream = end();
	var restoreCache = save.restore('bar');

	startStream.pipe(startCache)
			 .pipe(transformStream)
			 .pipe(restoreCache)
			 .on('error', function (err) {
				cb();
			 })
			 .pipe(endStream);

	endStream.on('end', function () {
		throw new Error('Should have thrown');
	});

	startStream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startStream.end();
});

it('should delete named cache stores', function (cb) {
	var startStream = start();
	var fooCache = save('foo');
	var barCache = save('bar');
	var transformStream = transform();
	var endStream = end();
	var clearCache = save.clear('bar');
	var restoreFooCache = save.restore('foo');
	var restoreBarCache = save.restore('bar');

	startStream.pipe(fooCache)
			 .pipe(barCache)
			 .pipe(transformStream)
			 .pipe(clearCache)
			 .pipe(restoreFooCache)
			 .pipe(restoreBarCache)
			 .pipe(endStream);

	restoreBarCache.on('error', function (err) {
		cb();
	});

	endStream.on('end', function () {
		throw new Error('Should have thrown');
	});

	startStream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startStream.end();
});

it('should clear the whole cache', function (cb) {
	var startStream = start();
	var startCache = save('test');
	var transformStream = transform();
	var endStream = end();
	var clearCache = save.clear();
	var restoreCache = save.restore('test');

	startStream.pipe(startCache)
			 .pipe(transformStream)
			 .pipe(clearCache)
			 .pipe(restoreCache)
			 .pipe(endStream);

	restoreCache.on('error', function (err) {
		cb();
	});

	endStream.on('end', function () {
		throw new Error('Should have thrown');
	});

	startStream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.js',
		contents: new Buffer('unicorns')
	}));

	startStream.end();
});
