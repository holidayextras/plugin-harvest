/* eslint no-unused-expressions:0 */
'use strict'

const _ = require('lodash')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect
const sinon = require('sinon')

const getBasket = require('../lib/getBasket')

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource (location) {
  return _.cloneDeep(require(location))
}

const successfulHarvestDb = {
  get: function (id, callback) {
    callback(null, {})
  }
}

const failedHarvestDb = {
  get: function (id, callback) {
    callback(new Error('An error has occurred'), null)
  }
}

const harvest = {
  getSharedBasket: function () {
    return {}
  }
}

describe('LIB: getBasket', function () {
  it('getBasket should throw an error if there is no options object', function () {
    return getBasket(harvest, successfulHarvestDb).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('getBasket should throw an error if there is no options.id', function () {
    return getBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithTag')).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.id')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('getBasket should throw an error if there is no options.tag', function () {
    return getBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithId')).then(function () {}, function (error) {
      expect(error).to.have.property('error').that.is.an.instanceof(TypeError)
      expect(error.error.message).to.equal('invalid options.tag')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('getBasket should reject if the document store throws an error', function () {
    return getBasket(harvest, failedHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag')).then(function () {}, function (error) {
      expect(error.error.message).to.equal('An error has occurred')
      expect(error).to.have.property('origin').that.is.equal('pluginHarvest')
    })
  })

  it('getBasket should get a basket from a document store based on the current id', function (done) {
    sinon.spy(successfulHarvestDb, 'get')
    getBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))
    expect(successfulHarvestDb.get.calledOnce).to.be.true
    successfulHarvestDb.get.restore()
    done()
  })

  it('getBasket should ask Harvest to get a shared basket based on the basket stored in the document store', function (done) {
    sinon.spy(harvest, 'getSharedBasket')
    getBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))
    expect(harvest.getSharedBasket.calledOnce).to.be.true
    harvest.getSharedBasket.restore()
    done()
  })

  describe('exceptions thrown', function () {
    before(function () {
      sinon.stub(harvest, 'getSharedBasket').callsFake(function () {
        throw new Error('Fake error')
      })
    })

    it('getBasket should reject if Harvest getSharedBasket throws an error', function () {
      return expect(getBasket(harvest, successfulHarvestDb, loadTestResource('./fixtures/requestWithIdAndTag'))).to.be.rejected.and.eventually.have.property('error').that.is.an.instanceof(Error)
    })

    after(function () {
      harvest.getSharedBasket.restore()
    })
  })
})
