const {join} = require('path');
const {test} = require('tape');
const read = require('../lib');

test('vfile-read', t => {
	const base = __dirname;
	let path;

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

	path = join(base, 'fixtures/two/two.txt');

	read(path).then(
		file => t.equal(
			Buffer.isBuffer(file.contents),
			true,
			'should default to fs readFile defaults.'
		),
		error => t.fail(error)
	);

	read(path, 'utf-8').then(
		file => t.equal(
			file.contents,
			'two\n',
			'should accept encoding as a string.'
		),
		error => t.fail(error)
	);

	t.equal(
		Buffer.isBuffer(read.sync(path).contents),
		true,
		'should default to fs readFile defaults. (sync)'
	);

	t.equal(
		read.sync(path, 'utf-8').contents,
		'two\n',
		'should accept encoding as string. (sync)'
	);

	path = join(base, 'fixtures/one');

	read(path, ['two'], (error, file) => {
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
			1,
			`should create nested contents in ${path}.`
		);

		t.equal(
			file.contents[0].path,
			join(base, 'fixtures/one/two'),
			`should have correct path for ${path}/two.`
		);

		t.equal(
			file.contents[0].contents[0].path,
			join(base, 'fixtures/one/two/three'),
			`should have correct path for ${path}/two/three.`
		);
	});

	t.equal(
		read.sync(path, ['two']).contents.length,
		0,
		'should accept an array as ignores.'
	);

	t.deepEqual(
		read.sync(path, ['two']).contents,
		[],
		'should ignore files/directories in ignores option.'
	);

	t.equal(
		read.sync(path).contents.length,
		1,
		`should create nested contents in ${path}.`
	);

	t.equal(
		read.sync(path).contents[0].path,
		join(base, 'fixtures/one/two'),
		`should have correct path for ${path}/two.`
	);

	path = join(base, 'fixtures/two');

	read(path, (error, file) => {
		if (error) {
			t.fail(`should not error reading ${path}.`);
		}

		t.equal(
			file.contents.length,
			2,
			`should create nested contents for ${path}.`
		);

		t.equal(
			Buffer.isBuffer(file.contents[1].contents),
			true,
			`should read contents of file for ${path}/two.txt.`
		);
	});

	t.equal(
		read.sync(path).contents.length,
		2,
		`should create nested contents for ${path}.`
	);

	t.equal(
		Buffer.isBuffer(read.sync(path).contents[1].contents),
		true,
		`should read contents of file for ${path}/two.txt.`
	);

	t.end();
});
