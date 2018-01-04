# vfile-read

> Read a file or directory into a vfile.

[![Travis](https://img.shields.io/travis/mrzmmr/vfile-read.svg)](https://travis-ci.org/mrzmmr/vfile-read)
[![Coveralls github](https://img.shields.io/coveralls/github/mrzmmr/vfile-read.svg)](https://coveralls.io/github/mrzmmr/vfile-read)

Read a file or directory into a [vfile](https://github.com/vfile/vfile) while keeping the directories structure using vfiles contents key. Vfile-read returns a promise if no callback is given.

## install

```sh
npm i vfile-read
```

## usage

Given:

```
./foo
|_ bar
  |_ foo.txt
    |_ "Foo"
```

```js
var read = require('vfile-read')

read('./foo')
  .then(console.log)
  .catch(console.error)
```

Outputs:

```js
VFile {
  data: {},
  messages: [],
  history: ['foo'],
  cwd: './',
  contents: [
    VFile {
      data: {},
      messages: [],
      history: ["foo/bar"],
      cwd: "./",
      contents: [
        VFile {
          data: {},
          messages: [],
          history: ["foo/bar/foo.txt"],
          cwd: "./",
          contents: "Foo"
        }
      ]
    }
  ]
}
```

## api

### `read` (location[, options [, callback]])

</br>

#### `location`
***`string`*** - Location to read from.

</br>

#### `options`?
[ ***`string`*** | ***`array`*** | ***`object`*** ] - If options is a string then options.encoding is set to options. If options is an array then options.ignores is set to options.

##### `options.encoding`
***string*** - default = 'utf-8'

##### `options.ignores`
***array*** - default = []

</br>

#### `callback`?
***`function`*** - If no callback is given, then read returns a promise. 

</br>

### `read#sync`

Synchronous version of vfile-read

```js
var read = require('vfile-read')

try {
  var file = read.sync('./', {ignores: ['node_modules'])
  ...
} catch (err) {
  ...
}
```

Vfile-read uses fs.readdir and fs.readFile and options will be passed down to those functions.

## related

[to-vfile](https://github.com/vfile/to-vfile) - Create a vfile from a file-path

## License

MIT &copy; Paul Zimmer
