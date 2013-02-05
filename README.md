# moquire
because mocking `require`d modules for unit tests should be easy

`moquire` loads modules in a new vmContext so you can be sure they're tested in isolation.

It uses [resolve](https://npmjs.org/package/resolve) to support the same module path resolution strategy as node's `require`.

Use moquire to test your modules in isolation without trying to hack around `require`.

`moquire` makes it stupid simple to intercept calls to node's favorite service locator, `require`.

`moquire` is designed to be as similar to `require` as possible - down to the name. The api footprint is intentionally small. If you need more functionality, see [sandboxed-module](https://npmjs.org/package/sandboxed-module).

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

## running the tests

    $ npm test

## inspired by
 * nathanmacinnes' [injectr](https://npmjs.org/package/injectr)
 * vojtajina's article [Testing Private State and Mocking Dependencies](http://howtonode.org/testing-private-state-and-mocking-deps)

## contributors

jden <jason@denizac.org> @leJDen

## license

(c) 2013 Agile Diagnosis <hello@agilediagnosis.com> See LICENSE.md