var vm = require('vm')
var fs = require('fs')
var path = require('path')
var resolve = require('resolve')

var cache = {}
var basedir = module && module.parent && module.parent.filename ? path.dirname(module.parent.filename) : ''

function load(path) {
  if (this === nocache) {
    return fs.readFileSync(path, 'utf8')
  }

  return path in cache
    ? cache[path]
    : (cache[path] = fs.readFileSync(path, 'utf8'))
    ;
}

function extend() {
  var obj = {}
  Array.prototype.slice.call(arguments).forEach(function (arg) {
    for (var prop in arg) {
      obj[prop] = arg[prop]
    }
  })
  return obj
}

// try to be as close to the original context as possible, by copying over
// Object.prototype and global into vm context
var copyObjectProto = vm.createScript('(function () {'
  + 'var base = Object.getOwnPropertyNames({}.__proto__);'
  + 'var extra = Object.getOwnPropertyNames(__o).filter(function(prop) { return base.indexOf(prop) === -1; });'
  + 'extra.forEach(function(prop){'
  +   'var getter = __o.__lookupGetter__(prop);'
  +   'var setter = __o.__lookupSetter__(prop);'
  +   'if (getter || setter) {'
  +     'if (getter) ({}).__proto__.__defineGetter__(prop, getter);'
  +     'if (setter) ({}).__proto__.__defineSetter__(prop, setter);'
  +   '} else {'
  +     '({}).__proto__[prop] = __o[prop];'
  +   '}'
  + '});'
  + 'delete __o;'
  + '})();');

function makeContext(context) {
  context.__o = Object.prototype

  var ctx = vm.createContext(context)
  copyObjectProto.runInContext(ctx)

  return ctx;
}

function moquire(path, mocks) {
  var resolved = resolve.sync(path, {basedir: basedir})

  mocks = mocks || {};
  var exports = {};
  var context = extend(global);
  context.require = function (path) {
      return mocks[path] || require(path)
    }
  var newExports = exports;
  context.__defineSetter__('exports', function(val) { newExports = val; })
  context.module = extend(module)
  context.module.exports = exports
  var ctx = makeContext(context)

  var source = load.call(this, resolved)

  vm.createScript(source, resolved)
    .runInContext(ctx)

    var exported;
    if (context.module.exports === exports && newExports === exports) {
      exported = context.module.exports;
    } else if (newExports === exports) {
      exported = context.module.exports;
    } else {
      exported = newExports;
    }

  return exported;

}

function nocache (path, mocks) {
  return moquire.call(nocache, path, mocks)
}

module.exports = moquire;
module.exports.nocache = nocache;