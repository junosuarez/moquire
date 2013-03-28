var vm = require('vm')
var fs = require('fs')
var dirname = require('path').dirname
var resolve = require('resolve')

// load it explicitly out of node_modules to prevent it from being mocked
var relquire = require('./node_modules/relquire')

// delete this module from the cache to force re-require in order to allow resolving test module via parent.module
delete require.cache[require.resolve(__filename)];

var cache = {}
var basedir = module && module.parent && module.parent.filename ? dirname(module.parent.filename) : ''
var packageBase = relquire.findBase(module.parent.dirname)

function load(filename) {
  if (this === nocache) {
    return _load(filename)
  }

  return filename in cache
    ? cache[filename]
    : (cache[filename] = _load(filename))
    ;
}

function _load(filename) {
  var content = fs.readFileSync(filename, 'utf8')
  // remove shebang
  content = content.replace(/^\#\!.*/, '');
  return content;
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
  path = relquire.resolve(path, packageBase)
  var resolved = resolve.sync(path, {basedir: basedir})
  var resolvedDir = dirname(resolved)
  var resolver = function (module) {
    return resolve.sync(module, {basedir: resolvedDir})
  }

  mocks = mocks || {};

  var exports = {};
  var context = extend(global);
  context.require = function (module) {
    var filename = resolver(module)
    return mocks[module] || require(filename)
  }
  context.require.resolve = resolver
  context.require.cache = {}

  mocks.relquire = function (rel) {
    if (mocks[rel]) {
      return mocks[rel]
    }
    var filename = relquire.resolve(rel, packageBase)
    return require(filename)
  }

  var newExports = exports;
  context.__defineSetter__('exports', function(val) { newExports = val; })
  context.module = extend(module)
  context.module.parent = {
    id: resolved,
    exports: exports,
    parent: module.parent,
    filename: resolved,
    loaded: true,
    children: [],
    paths: [require('path').resolve(dirname(resolved), './node_modules')].concat(module.parent.paths)
  }
  context.module.exports = exports
  context.__filename = resolved
  context.__dirname = resolvedDir
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