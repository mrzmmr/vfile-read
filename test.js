'use strict'

var fs = require('fs')
var clone = require('clone')
var vfile = require('vfile')
var mkdirp = require('mkdirp')
var tape = require('blue-tape')

var read = require('./')

mkdirp.sync('./foo/bar')
fs.writeFileSync('./foo/bar/bar.txt', 'bar', 'utf-8')
fs.writeFileSync('./foo/bar/foo.txt', 'foo', 'utf-8')
mkdirp.sync('./baz/bar')
mkdirp.sync('./baz/foo')

var baz = vfile({
  path: 'baz',
  contents: [
    vfile({path: 'baz/bar', contents: []}),
    vfile({path: 'baz/foo', contents: []})
  ]
})

var foo = vfile({
  path: 'foo',
  contents: [
    vfile({
      path: 'foo/bar',
      contents: [
        vfile({
          path: 'foo/bar/bar.txt',
          contents: 'bar'
        }),
        vfile({
          path: 'foo/bar/foo.txt',
          contents: 'foo'
        })
      ]
    })
  ]
})

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

tape.test('using options', function (t) {
  var options = {encoding: 'utf-8', ignores: ['foo/bar/bar.txt']}
  read('./foo', options).then(function (res1) {
    read('./foo', options, function (err, res2) {
      if (err) {
        t.fail(err)
      }

      try {
        var res3 = read.sync('./foo', options)
        var mod = clone(foo)
        mod.contents[0].contents.splice(0, 1)

        t.deepEqual(res1, mod)
        t.deepEqual(res2, mod)
        t.deepEqual(res3, mod)
      } catch (err) {
        t.fail(err)
      }
    })
  }).catch(t.fail)
  t.end()
})

tape.test('using string encoding option', function (t) {
  read('./foo', 'utf-8', function (err, res1) {
    if (err) {
      t.fail(err)
    }

    try {
      var res2 = read.sync('./foo', 'utf-8')
      t.deepEqual(res1, foo)
      t.deepEqual(res2, foo)
    } catch (err) {
      t.fail(err)
    }
  })
  t.end()
})

tape.test('using array ignores option', function (t) {
  read('./foo', ['foo/bar/bar.txt'], function (err, res1) {
    if (err) {
      t.fail(err)
    }

    try {
      var res2 = read.sync('./foo', ['foo/bar/bar.txt'])
      var mod = clone(foo)
      mod.contents[0].contents.splice(0, 1)
      t.deepEqual(res1, mod)
      t.deepEqual(res2, mod)
    } catch (err) {
      t.fail(err)
    }
  })
  t.end()
})

tape.test('no options', function (t) {
  read('./foo').then(function (res1) {
    read('./foo', function (err, res2) {
      if (err) {
        t.fail(err)
      }

      try {
        var res3 = read.sync('./foo')
        t.deepEqual(res1, foo)
        t.deepEqual(res2, foo)
        t.deepEqual(res3, foo)
      } catch (err) {
        t.fail(err)
      }
    })
  }).catch(t.fail)

  read('./baz').then(function (res1) {
    read('./baz', function (err, res2) {
      if (err) {
        t.fail(err)
      }

      try {
        var res3 = read.sync('./baz')
        t.deepEqual(res1, baz)
        t.deepEqual(res2, baz)
        t.deepEqual(res3, baz)
      } catch (err) {
        t.fail(err)
      }
    })
  }).catch(t.fail)
  t.end()
})
