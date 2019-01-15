exports.contains = (value, array) => array.indexOf(value) > -1;

exports.promised = (fn, path, options) => {
	return new Promise((resolve, reject) => {
		return fn(path, options, (error, file) => {
			if (error) {
				return reject(error);
			}
			return resolve(file);
		});
	});
};

exports.setup = (options = {}, fn) => {
	if (typeof options === 'function') {
		fn = options;
		options = {};
	}

	if (Array.isArray(options)) {
		options = {
			ignores: options
		};
	}

	if (typeof options === 'string') {
		options = {
			encoding: options
		};
	}

	options.ignores = options.ignores || [];

	return [options, fn];
};
