'use strict';

var fs = require('fs');
var path = require('path');
var vfile = require('vfile');

module.exports = read;
module.exports.sync = readSync;

function read(location, options, callback) {
  var queue;
  var root;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!callback) {
    return new Promise(function (resolve, reject) {
      return read(location, options, function (err, file) {
        if (err) {
          return reject(err);
        }
        return resolve(file);
      });
    });
  }

  root = vfile({contents: []});
  queue = [location, root];
  options = options || {};

  if (Array.isArray(options)) {
    options = {ignores: options};
  } else if (typeof options === 'string') {
    options = {encoding: options};
  }

  options.ignores = [].concat(options.ignores);
  options.encoding = options.encoding || 'utf-8';

  recurse();

  function recurse() {
    var current = queue.shift();
    var parent = queue.shift();
    var node;

    if (!current) {
      return callback(null, root.contents[0]);
    }

    if (parent.path) {
      current = path.join(parent.path, current);
    }

    if (options.ignores.indexOf(current) > -1) {
      return recurse();
    }

    return fs.stat(current, function (err, stat) {
      if (err) {
        return callback(err);
      }

      node = vfile({path: current});

      parent.contents.push(node);

      if (stat.isDirectory()) {
        return fs.readdir(current, function (err, files) {
          /* istanbul ignore if */
          if (err) {
            return callback(err);
          }

          node.contents = [];

          files.forEach(function (file) {
            queue.push(file, node);
          });

          if (queue.length === 0) {
            return callback(null, root.contents[0]);
          }

          return recurse();
        });
      }
      return fs.readFile(current, options, function (err, data) {
        /* istanbul ignore if */
        if (err) {
          return callback(err);
        }

        node.contents = data;

        if (queue.length === 0) {
          return callback(null, root.contents[0]);
        }

        return recurse();
      });
    });
  }
}

function readSync(location, options) {
  var current;
  var parent;
  var queue;
  var root;
  var stat;
  var node;
  var dirs;
  var file;
  var i;

  root = vfile({contents: []});
  queue = [location, root];
  options = options || {};

  if (Array.isArray(options)) {
    options = {ignores: options};
  } else if (typeof options === 'string') {
    options = {encoding: options};
  }

  options.ignores = [].concat(options.ignores);
  options.encoding = options.encoding || 'utf-8';

  while (queue.length > 0) {
    current = queue.shift();
    parent = queue.shift();

    if (parent.path) {
      current = path.join(parent.path, current);
    }

    if (current && options.ignores.indexOf(current) > -1) {
      continue;
    }

    node = vfile({path: current, contents: []});

    stat = fs.statSync(node.path);
    i = -1;

    if (stat.isDirectory()) {
      dirs = fs.readdirSync(current, options);
      while (i++ < dirs.length - 1) {
        queue.push(dirs[i], node);
      }
    } else {
      file = fs.readFileSync(current, options);
      node.contents = file;
    }

    parent.contents.push(node);
  }

  return root.contents[0];
}

