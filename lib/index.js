'use strict';

const fs = require('fs');
const {join, parse} = require('path');
const vfile = require('vfile');
const bail = require('bail');
const {contains, setup, promised} = require('./utils');

const read = (path, options, callback) => {
	const [settings, fn] = setup(options, callback);
	const root = vfile({contents: []});
	const queue = [path, root];
	const {ignores} = settings;

	if (!fn) {
		return promised(read, path, settings);
	}

	if (typeof path !== 'string') {
		return fn(new Error('Expected a `string` as first argument.'));
	}

	const handleDirectory = (current, parent) => {
		return fs.readdir(current, (error, files) => {
			bail(error);
			files.forEach(file => queue.push(file, parent));
			return check();
		});
	};

	const handleFile = (current, parent, settings) => {
		return fs.readFile(current, settings, (error, data) => {
			bail(error);
			parent.contents = data;
			return check();
		});
	};

	const check = () => {
		if (queue.length === 0) {
			return fn(null, root.contents[0]);
		}
		return walk();
	};

	const walk = () => {
		let current = queue.shift();
		const parent = queue.shift();
		let node;

		if (!current) {
			return fn(null, root.contents[0]);
		}

		if (parent.path) {
			current = join(parent.path, current);
		}

		if (contains(current, ignores) || contains(parse(current).base, ignores)) {
			return walk();
		}

		return fs.stat(current, (error, stat) => {
			bail(error);

			node = vfile({
				path: current,
				contents: []
			});

			parent.contents.push(node);

			if (stat.isDirectory()) {
				return handleDirectory(current, node);
			}

			return handleFile(current, node, settings);
		});
	};

	return walk();
};

const sync = (path, options) => {
	const [settings] = setup(options);
	const root = vfile({contents: []});
	const queue = [path, root];
	const {ignores} = settings;

	if (typeof path !== 'string') {
		throw new TypeError('Expected a `string` as first argument.');
	}

	while (queue.length > 0) {
		let current = queue.shift();
		const parent = queue.shift();

		if (parent.path) {
			current = join(parent.path, current);
		}

		if (contains(current, ignores) || contains(parse(current).base, ignores)) {
			continue;
		}

		const node = vfile({
			path: current,
			contents: []
		});

		const stats = fs.statSync(node.path);

		if (stats.isDirectory()) {
			const dirs = fs.readdirSync(current, settings);
			dirs.forEach(dir => queue.push(dir, node));
		} else {
			const data = fs.readFileSync(current, settings);
			node.contents = data;
		}

		parent.contents.push(node);
	}

	return root.contents[0];
};

read.sync = sync;

module.exports = read;
