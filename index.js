var vm = require('vm')
var fs = require('fs')
var path = require('path')
var resolve = require('resolve')

var cache = {}
var basedir = path.dirname(module.parent.filename)

function shallowClone(obj) {
  var clone = {}
  for(var prop in obj) {
    clone[prop] = obj[prop]
  }
  return clone
}

function load(path) {

  if (this === nocache) {
    return fs.readFileSync(path, 'utf8')
  }

  return path in cache
    ? cache[path]
    : (cache[path] = fs.readFileSync(path, 'utf8'))
    ;
}

function moquire(path, mocks) {
  var resolved = resolve.sync(path, {basedir: basedir})

  mocks = mocks || {};
  var exports = {};
  var context = shallowClone(global)
  context.__objectProto = Object.prototype
  context.require = function (path) {
      return mocks[path] || require(path)
    }
  context.exports = exports
  context.module = shallowClone(module)
  context.module.exports = exports

  // pass through context
  var source = load.call(this, resolved)
  // copy Object.prototype
  source = "Object.getOwnPropertyNames(__objectProto).forEach(function(x){Object.prototype[x] = __objectProto[x]});" + source

  vm.createScript(source, resolved)
    .runInNewContext(context)

    var exported;
    if (context.module.exports === context.exports) {
      exported = context.module.exports;
    } else if (context.exports === exports) {
      exported = context.module.exports;
    } else {
      exported = context.exports;
    }

  return exported;

}

function nocache (path, mocks) {
  return moquire.call(nocache, path, mocks)
}

module.exports = moquire;
module.exports.nocache = nocache;