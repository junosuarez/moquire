var moquire = require('../index')
var chai = require('chai')
chai.should()

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
    d.should.equal('foo')
  })
})
