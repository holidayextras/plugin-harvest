/* eslint no-unused-expressions:0 */
'use strict'

const _ = require('lodash')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect
const sinon = require('sinon')

const postBasketVersion = require('../lib/postBasketVersion')

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource (location) {
  return _.cloneDeep(require(location))
}

const harvestDbWithSuccessfulGetAndInsert = {
  get: function (id, callback) {
    callback(null, {})
  },
  insert: function (document, id, callback) {
    callback(null, {})
  }
}

const harvestDbWithSuccessfulGetAndFailedInsert = {
  get: function (id, callback) {
    callback(null, {})
  },
  insert: function (document, id, callback) {
    callback(new Error('An error has occurred inserting document'), null)
  }
}

const harvestDbWithFailedGet = {
  get: function (id, callback) {
    callback(new Error('An error has occurred getting document'), null)
  }
}

const harvest = {
  getSharedBasket: function () {
    return {}
  },
  addVersion: function () {
    return {}
  }
}

describe('LIB: postBasketVersion', function () {
  it('postBasketVersion should throw an error if there is no options object', function () {
    return postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should throw an error if there is no options.id', function () {
    return postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithTag')).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.id')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should throw an error if there is no options.tag', function () {
    return postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithId')).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.tag')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should throw an error if there is no options.version', function () {
    return postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTag')).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.version')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should reject if the document store throws an error on select', function () {
    return postBasketVersion(harvest, harvestDbWithFailedGet, loadTestResource('./fixtures/requestWithIdAndTagAndVersion')).then(function () {}, function (error) {
      expect(error.error.message).to.equal('An error has occurred getting document')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should reject if the document store throws an error on select', function () {
    return postBasketVersion(harvest, harvestDbWithSuccessfulGetAndFailedInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion')).then(function () {}, function (error) {
      expect(error.error.message).to.equal('An error has occurred inserting document')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('postBasketVersion should get a basket from a document store based on the current id', function (done) {
    sinon.spy(harvestDbWithSuccessfulGetAndInsert, 'get')
    postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))
    expect(harvestDbWithSuccessfulGetAndInsert.get.calledOnce).to.be.true
    harvestDbWithSuccessfulGetAndInsert.get.restore()
    done()
  })

  it('postBasketVersion should ask Harvest to add a version to the basket', function (done) {
    sinon.spy(harvest, 'addVersion')
    postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))
    expect(harvest.addVersion.calledOnce).to.be.true
    harvest.addVersion.restore()
    done()
  })

  it('postBasketVersion should insert the basket to the document store', function (done) {
    sinon.spy(harvestDbWithSuccessfulGetAndInsert, 'insert')
    postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))
    expect(harvestDbWithSuccessfulGetAndInsert.insert.calledOnce).to.be.true
    harvestDbWithSuccessfulGetAndInsert.insert.restore()
    done()
  })

  it('postBasketVersion should ask Harvest to get a shared basket based on the basket that has been stored in the document store', function (done) {
    sinon.spy(harvest, 'getSharedBasket')
    postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))
    expect(harvest.getSharedBasket.calledOnce).to.be.true
    harvest.getSharedBasket.restore()
    done()
  })

  describe('exception thrown in addVersion', function () {
    before(function () {
      sinon.stub(harvest, 'addVersion').callsFake(function () {
        throw new Error('Fake error')
      })
    })

    it('postBasket should reject if Harvest addVersion throws an error', function () {
      return expect(postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))).to.be.rejected.and.eventually.have.property('error').that.is.an.instanceof(Error)
    })

    after(function () {
      harvest.addVersion.restore()
    })
  })

  describe('exception thrown in getSharedBasket', function () {
    before(function () {
      sinon.stub(harvest, 'getSharedBasket').callsFake(function () {
        throw new Error('Fake error')
      })
    })

    it('postBasket should reject if Harvest getSharedBasket throws an error', function () {
      return expect(postBasketVersion(harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource('./fixtures/requestWithIdAndTagAndVersion'))).to.be.rejected.and.eventually.have.property('error').that.is.an.instanceof(Error)
    })

    after(function () {
      harvest.getSharedBasket.restore()
    })
  })
})
