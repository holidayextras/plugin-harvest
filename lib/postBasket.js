'use strict'

var _ = require('lodash')
var Q = require('q')
var buildReject = require('./buildReject')

module.exports = function PostBasket (harvest, harvestDb, options) {
  var deferred = Q.defer()

  try {
    if (!options) {
      throw new TypeError('invalid options')
    }

    if (!options.tag || !_.isString(options.tag)) {
      throw new TypeError('invalid options.tag')
    }

    // *****************************************************************************************
    // Interaction Flow
    // 1. Create a stored basket based on information that has been passed in (requestedBasket)
    // 2. Store this basket into the harvest db
    // 3. Get a shared basket to pass back
    // ******************************************************************************************

    var requestedBasket = {
      tag: options.tag,
      data: options.data
    }
    // if the put basket has failed create a basket with our original id
    if (options.id && options.version) {
      requestedBasket.id = options.id
      requestedBasket.version = options.version
    }

    var storedBasket = harvest.createBasket(requestedBasket)
    harvestDb.insert(storedBasket, function (error, document) {
      if (error) {
        deferred.reject(buildReject(error, options))
      } else {
        try {
          // Nano just replies back with ok:true so lets smash the id and rev onto the document that we asked to be stored.
          var persistedBasket = {
            _id: document.id,
            _rev: document.rev
          }
          _.extend(persistedBasket, storedBasket)

          deferred.resolve(harvest.getSharedBasket(persistedBasket, options.tag))
        } catch (getBasketError) {
          deferred.reject(buildReject(getBasketError, options))
        }
      }
    })
  } catch (error) {
    deferred.reject(buildReject(error, options))
  }

  return deferred.promise
}
