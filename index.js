'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var cache = {};

module.exports = function (store, opts) {
	if (!store || typeof store !== 'string') {
		throw new gutil.PluginError('gulp-save', '`store` parameter must be string');
	}

	cache[store] = [];

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			cb();
			return;
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-save', 'Streaming not supported'));
			cb();
			return;
		}

		cache[store].push(file.clone(opts));
		this.push(file);
		cb();
	});
};

module.exports.restore = function (store, opts) {
	if (!store || typeof store !== 'string') {
		throw new gutil.PluginError('gulp-save', '`store` parameter must be string');
	}

	return through.obj(function (file, enc, cb) {
		cb();
	}, function (cb) {

		if (!cache[store]) {
			this.emit('error', new gutil.PluginError('gulp-save', 'Cache for `'+ store +'` not found'));
			cb();
			return;
		}

		cache[store].forEach(function (file) {
			this.push(file.clone(opts));
		}.bind(this));

		cb();
	});
};

module.exports.clear = function () {
	if (arguments.length) {
		var stores = Array.prototype.slice.call(arguments).filter(function (store) {
			if (typeof store !== 'string') {
				gutil.log('gulp-save', gutil.colors.red('Store names must be strings'));
				return false;
			}

			return true;
		});
	}

	return through.obj(function (file, enc, cb) {
		this.push(file);
		cb();
	}, function (cb) {
		(stores || Object.keys(cache)).forEach(function (store) {
			delete cache[store];
		});

		cb();
	});
};
