'use strict'

var _ = require('lodash')
var Q = require('q')
var buildReject = require('./buildReject')

module.exports = function GetBasket (harvest, harvestDb, options) {
  var deferred = Q.defer()

  try {
    if (!options) {
      throw new TypeError('invalid options')
    }

    if (!options.id || !_.isString(options.id)) {
      throw new TypeError('invalid options.id')
    }

    if (!options.tag || !_.isString(options.tag)) {
      throw new TypeError('invalid options.tag')
    }

    // *****************************************************************************************
    // Interaction Flow
    // 1. Get a stored basket out of the harvest database with the requested id
    // 2. Convert to a shared basket structure based on the requested tag
    // ******************************************************************************************
    harvestDb.get(options.id, function (error, storedBasket) {
      if (error) {
        deferred.reject(buildReject(error, { code: 'H001', options: options }))
      } else {
        try {
          deferred.resolve(harvest.getSharedBasket(storedBasket, options.tag))
        } catch (harvestError) {
          deferred.reject(buildReject(harvestError, { code: 'H002', options: options }))
        }
      }
    })
  } catch (error) {
    deferred.reject(buildReject(error, options))
  }

  return deferred.promise
}
