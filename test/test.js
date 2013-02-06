var moquire = require('../index')
var chai = require('chai')
chai.should()
chai.use(require('chai-interface'))
var sinon = require('sinon')

describe('moquire', function () {

  it('uses the same path identifiers as node require', function () {
    var a = require('./a')
    var a2 = moquire('./a')

    a.should.equal(a2)
  })

  it('takes an optional object dictionary of mock module instances', function () {
    var mockA = 'fake dependency'
    var b = moquire('./b', {'./a': mockA})

    b.a.should.equal(mockA)

  })

  it('can require mock native modules', function () {
    var mockFs = {}
    var c = moquire('./c', {'fs': mockFs})
    c.fs.should.equal(mockFs)
  })

  it('can require actual native modules', function () {
    var c = moquire('./c')
    var fs = require('fs')
    c.fs.should.equal(fs)
  })

  it('supports exports as well as module.exports', function () {
    var d = moquire('./d')
    d.should.equal('baz')
  })

  it('passes normal global objects to the called module', function () {
    var e = moquire('./e')
    e.should.have.interface({
      setTimeout: Function,
      setInterval: Function,
      clearTimeout: Function,
      clearInterval: Function,
      process: Object,
      console: Object
    })
  })

  it('can call nested requires', function () {
    moquire('./r').should.equal('r2')
  })

  it('caches module source on repeat moquires', function () {
    // get meta
    var mockFs = {readFileSync: sinon.stub().returns('')}
    var mockResolve = {sync: sinon.stub().returns('')}
    var m = moquire('../index', {fs: mockFs, resolve: mockResolve})

    m('./a')
    m('./a')

    mockFs.readFileSync.callCount.should.equal(1)
  })

  it('copies over Object.prototype for stubborn people like me who like to use "such strange test apis"', function () {
    var f = moquire('./f')

    var here = Object.getOwnPropertyNames(f.__proto__)
    var there = Object.getOwnPropertyNames({}.__proto__)
    here.should.deep.equal(there)
  })

  describe('.nocache', function () {
    it('loads module source from disk each time', function () {
      // get meta
      var mockFs = {readFileSync: sinon.stub().returns('')}
      var mockResolve = {sync: sinon.stub().returns('')}
      var m = moquire('../index', {fs: mockFs, resolve: mockResolve}).nocache

      m('./a')
      m('./a')

      mockFs.readFileSync.callCount.should.equal(2)
    })
  })

})