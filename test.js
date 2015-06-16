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
