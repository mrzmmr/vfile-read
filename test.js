'use strict

var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var tape = require('blue-tape')

var read = require('./')

mkdirp.sync('./foo/bar')
fs.writeFileSync('./foo/bar/bar.txt', 'bar', 'utf-8')
fs.writeFileSync('./foo/bar/foo.txt', 'foo', 'utf-8')
mkdirp.sync('./baz/foo')
fs.writeFileSync('./baz/bar', 'bar', 'utf-8')

tape('error / reject if path does not exist', function (t) {
  read('./bar', function (err, res) {
    t.throws(function () {
      if (err) {
        throw err
      }
    })

    t.shouldFail(read('./bar'))
  })
  t.end()
})

tape('return undefined if no arguments', function (t) {
  read().then(function (res) {
    t.ok(!res)
  }).catch(t.fail)
  t.end()
})

tape('return undefined if no arguments', function (t) {
  var file = read.sync()
  t.ok(file == null)
  t.end()
})

tape('using array as ignore option', function (t) {
  return read('./baz', ['bar']).then(function (file) {
    t.ok(file.contents.length === 1)
  }).catch(t.threw)
})

tape('using array as ignore option sync', function (t) {
  var file = read.sync('./baz', ['bar'])
  t.ok(file.contents.length === 1)
  t.ok(file.contents[0].path === 'baz/foo')
  t.end()
})

tape('using string as encoding option sync', function (t) {
  var file = read.sync('./baz', 'utf-8')
  t.ok(file.contents[0].contents === 'bar')
  t.end()
})

tape('using string as encoding option', function (t) {
  return read('./baz', 'utf-8').then(function (file) {
    t.ok(file.contents[0].contents === 'bar')
  }).catch(t.threw)
})

tape('using options object', function (t) {
  return read('./baz', {encoding: 'utf-8'}).then(function (file) {
    t.ok(file.contents[0].contents === 'bar')
  }).catch(t.threw)
})

tape('using no options', function (t) {
  return read('./baz').then(function (file) {
    t.ok(file.contents[0].contents instanceof Buffer, file.contents[0])
  })
})

tape('paths update correctly', function (t) {
  return read(path.join(process.cwd(), 'foo')).then(function (file) {
    t.ok(file.contents[0].path === path.join(process.cwd(), 'foo', 'bar'))
  })
})
