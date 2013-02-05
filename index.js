var vm = require('vm')
var fs = require('fs')
var resolve = require('resolve')

function load(path, cache) {
  return cache[path]
    || (cache[path] = fs.readFileSync(path, 'utf8'))
}

var init = function (basedir) {
  var files = {};

  return function moquire(path, mocks) {
    var resolved = resolve.sync(path, {basedir: basedir})

    mocks = mocks || {};
    var exports = {};
    var context = {
      require: function (path) {
        return mocks[path] || require(path)
      },
      exports: exports,
      module: {
        exports: exports
      }
    }

    var source = load(resolved, files)

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
}




module.exports = init;