const {join} = require('path');
const {test} = require('tape');
const read = require('../lib');

test('vfile-read', t => {
	const path = join(__dirname, 'fixtures/one');

	read().then(
		() => t.fail,
		({message}) => {
			t.equal(
				message,
				'Expected a `string` as first argument.',
				'should reject with no arguments.'
			);
		}
	);

	read({}, error => {
		if (!error) {
			t.fail(error);
		}

		t.equal(
			error.message,
			'Expected a `string` as first argument.',
			'should return error if path is not a string.'
		);
	});

	t.throws(
		() => read.sync(),
		/Expected a `string` as first argument./,
		'should throw with no arguments.'
	);

	read(join(path, 'one.txt')).then(
		file => t.equal(
			Buffer.isBuffer(file.contents),
			true,
			'should default to fs readFile defaults.'
		),
		error => t.fail(error)
	);

	read(join(path, 'one.txt'), 'utf-8').then(
		file => t.equal(
			file.contents,
			'one\n',
			'should accept encoding as a string.'
		),
		error => t.fail(error)
	);

	t.equal(
		Buffer.isBuffer(read.sync(join(path, 'one.txt')).contents),
		true,
		'should default to fs readFile defaults. (sync)'
	);

	t.equal(
		read.sync(join(path, 'one.txt'), 'utf-8').contents,
		'one\n',
		'should accept encoding as string. (sync)'
	);

	read(path, ['two', 'one.txt'], (error, file) => {
		if (error) {
			t.fail(error);
		}

		t.equal(
			file.contents.length,
			0,
			'should accept an array as ignores.'
		);

		t.deepEqual(
			file.contents,
			[],
			'should ignore files/directories in ignores option.'
		);
	});

	read(path, (error, file) => {
		if (error) {
			t.fail('should not error.');
		}

		t.equal(
			file.contents.length,
			2,
			`should create nested contents in ${path}.`
		);

		t.equal(
			file.contents[0].path,
			join(path, 'one.txt'),
			`should have correct path for ${path}/one.txt.`
		);
	});

	t.equal(
		read.sync(path, ['two', 'one.txt']).contents.length,
		0,
		'should accept an array as ignores.'
	);

	t.deepEqual(
		read.sync(path, ['two', 'one.txt']).contents,
		[],
		'should ignore files/directories in ignores option.'
	);

	t.equal(
		read.sync(path).contents.length,
		2,
		`should create nested contents in ${path}.`
	);

	t.equal(
		read.sync(path).contents[0].path,
		join(path, 'one.txt'),
		`should have correct path for ${path}/one.txt.`
	);

	t.end();
});
