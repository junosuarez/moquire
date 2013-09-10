# moquire
because mocking `require`d modules for unit tests should be easy

`moquire` loads modules in a new vmContext so you can be sure they're tested in isolation.

It uses [resolve](https://npmjs.org/package/resolve) to support the same module path resolution strategy as node's `require`.

Use moquire to test your modules in isolation without trying to hack around `require`.

`moquire` makes it stupid simple to intercept calls to node's favorite service locator, `require`.

`moquire` is designed to be as similar to `require` as possible - down to the name. The api footprint is intentionally small. If you need more functionality, see [sandboxed-module](https://npmjs.org/package/sandboxed-module) or [proxyquire](https://npmjs.org/package/proxyquire).

## install

    $ npm install moquire

## usage

    var moquire = require('moquire')

    var moduleUnderTest = moquire('../test', {
      depA: {},
      depB: function (){}
    })

    // moduleUnderTest is loaded with `depA` and `depB` mocked

Some test runners will keep the same instance of `moquire` between runs when in watch mode (for example, for Test-Driven Development). In this case, you probably don't want caching. You can access a version of `moquire` with caching disabled like so:

    var moquire = require('moquire').nocache

or

    var moquire = require('moquire')
    moquire.nocache('foo', {})

## relquire

Since 1.5.0, `moquire` supports mocking [`relquire`](https://npm.im/relquire) dependencies like so:

Let's imagine a project laid out like:

    ├── a.js
    ├── foo.js
    └── test
        └── test.js

`a.js`:

    var relquire = require('relquire')
    var foo = relquire('~/foo')

`test.js`:

    var moquire = require('moquire')
    var fakeFoo = {}
    var a = moquire('../a', {'~/foo': fakeFoo})

Of course, you can use relative requires in `moquire`, too:

    var a = moquire('~/a', {'~/foo': fakeFoo})


## running the tests

    $ npm test

## inspiration & kudos
 * @nathanmacinnes' [injectr](https://npmjs.org/package/injectr)
 * @vojtajina's article [Testing Private State and Mocking Dependencies](http://howtonode.org/testing-private-state-and-mocking-deps)
 * @thlorenz for the pointer on [#1](https://github.com/jden/moquire/issues/1)

## contributors

jden <jason@denizac.org> @leJDen

## license

(c) 2013 Agile Diagnosis <hello@agilediagnosis.com> See LICENSE.md