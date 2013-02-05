# moquire
because mocking `require`d modules for unit tests should be easy

`moquire` loads modules in a new vmContext so you can be sure they're tested in isolation.

It uses [resolve](https://npmjs.org/package/resolve) to support the same module path resolution strategy as node's `require`.

Use moquire to test your modules in isolation without trying to hack around `require`.

## install

    $ npm install moquire

## usage

Pass in `__dirname` to initialize `moquire` with the current file's directory (so it can resolve relative paths)

    var moquire = require('moquire')(__dirname)

    var moduleUnderTest = moquire('../test', {
      depA: {},
      depB: function (){}
    })

    // moduleUnderTest is loaded with `depA` and `depB` mocked

## running the tests

    $ npm test

## inspired by
 * nathanmacinnes' [injectr](https://npmjs.org/package/injectr)
 * vojtajina's article [Testing Private State and Mocking Dependencies](http://howtonode.org/testing-private-state-and-mocking-deps)

## contributors

jden <jason@denizac.org> @leJDen

## license

(c) 2013 Agile Diagnosis <hello@agilediagnosis.com> See LICENSE.md