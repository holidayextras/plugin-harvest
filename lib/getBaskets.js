'use strict'

var _ = require('lodash')
var Q = require('q')
var buildReject = require('./buildReject')

module.exports = function GetBaskets (harvest, harvestDb, options) {
  var deferred = Q.defer()
  var designDocument
  var view
  var params = {}

  // Used if we don't pass in timestamps for design documents that need them.
  var currentTime = (new Date()).toISOString()

  try {
    if (!options) {
      throw new TypeError('invalid options')
    }

    // Can't think of a better way of doing this - we need to examine different keys to call separate design documents on CouchDB
    if (options.pin) {
      designDocument = 'all_baskets'
      view = 'by_pin'
      params.key = options.pin
    } else if (options.email) {
      designDocument = 'all_baskets'
      view = 'by_email'
      params.key = options.email
    } else if (options.telephone) {
      designDocument = 'all_baskets'
      view = 'by_telephone'
      params.key = options.telephone
    } else if (options.familyName) {
      designDocument = 'all_baskets'
      view = 'by_family_name'
      params.key = options.familyName
    } else if (options.type === 'phone') {
      designDocument = 'phone_baskets'
      view = 'by_created_at'
      params.startkey = options.since || currentTime
      params.endkey = options.until || currentTime
    } else if (options.type === 'email') {
      designDocument = 'email_baskets'
      view = 'by_created_at'
      params.startkey = options.since || currentTime
      params.endkey = options.until || currentTime
    } else {
      throw new TypeError('invalid keys within options')
    }

    // *****************************************************************************************
    // Interaction Flow
    // 1. Get stored baskets from the relevant design document using passed in options
    // 2. Convert each to a shared basket structure based on the requested tag
    // ******************************************************************************************
    harvestDb.view(designDocument, view, params, function (error, document) {
      var sharedBaskets = []
      if (error) {
        deferred.reject(buildReject(error, options))
      } else {
        _.forEach(document.rows, function (storedBasket) {
          sharedBaskets.push(harvest.getSharedBasket(storedBasket.value))
        })
        deferred.resolve(sharedBaskets)
      }
    })
  } catch (error) {
    deferred.reject(buildReject(error, options))
  }

  return deferred.promise
}
