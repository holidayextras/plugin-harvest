/* eslint no-unused-expressions:0 */
'use strict'

var _ = require('lodash')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var sinon = require('sinon')

var postBasket = require('../lib/postBasket')

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource (location) {
  return _.cloneDeep(require(location))
}

var successfulHarvestDb = {
  insert: function (document, callback) {
    callback(null, {})
  }
}

var failedHarvestDb = {
  insert: function (id, callback) {
    callback(new Error('An error has occurred'), null)
  }
}

var harvest = {
  createBasket: function () {
    return {}
  },
  getSharedBasket: function () {
    return {}
  }
}

describe('LIB: postBasket', function () {
  it('postBasket should throw an error if there is no options object', function () {
    return postBasket(harvest, successfulHarvestDb).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasket should throw an error if there is no options.tag', function () {
    return postBasket(harvest, successfulHarvestDb, {}).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.tag')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasket should reject if the document store throws an error', function () {
    return postBasket(harvest, failedHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag')).then(function () {}, function (error) {
      expect(error.error).to.equal('An error has occurred')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasket should ask Harvest to create a basket', function (done) {
    sinon.spy(harvest, 'createBasket')
    postBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))
    expect(harvest.createBasket.calledOnce).to.be.true
    harvest.createBasket.restore()
    done()
  })

  it('postBasket should insert a basket into the document store', function (done) {
    sinon.spy(successfulHarvestDb, 'insert')
    postBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))
    expect(successfulHarvestDb.insert.calledOnce).to.be.true
    successfulHarvestDb.insert.restore()
    done()
  })

  it('postBasket should ask Harvest to get a shared basket based on the basket stored in the document store', function (done) {
    sinon.spy(harvest, 'getSharedBasket')
    postBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))
    expect(harvest.getSharedBasket.calledOnce).to.be.true
    harvest.getSharedBasket.restore()
    done()
  })

  describe('exceptions thrown', function () {
    before(function () {
      sinon.stub(harvest, 'getSharedBasket', function () {
        throw new Error('Fake error')
      })
    })

    it('postBasket should reject if Harvest getSharedBasket throws an error', function () {
      return expect(postBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))).to.be.rejected.and.eventually.have.property('error').that.is.an.instanceof(Error)
    })

    after(function () {
      harvest.getSharedBasket.restore()
    })
  })
})
