'use strict';

var _ = require( 'lodash' );
var Q = require( 'q' );
var buildReject = require( './buildReject' );

module.exports = function PostBasketVersion( harvest, harvestDb, options ) {

  var deferred = Q.defer();

  try {

    if ( !options ) {
      throw new TypeError( 'invalid options' );
    }

    if ( !options.id || !_.isString( options.id ) ) {
      throw new TypeError( 'invalid options.id' );
    }

    if ( !options.tag || !_.isString( options.tag ) ) {
      throw new TypeError( 'invalid options.tag' );
    }

    if ( !options.version || !_.isString( options.version ) ) {
      throw new TypeError( 'invalid options.version' );
    }

    // The shared basket is in effect all the options passed in but lets keep both names for consistency for both our Hapi plugins and Harvest
    var sharedBasket = options;

    // *****************************************************************************************
    // Interaction Flow
    // 1. Get a stored basket out of the harvest database with the requested id
    // 2. Add a version to that stored basket
    // 3. Get a shared basket to pass back
    // ******************************************************************************************
    harvestDb.get( sharedBasket.id, function( error, storedBasket ) {
      if ( error ) {
        deferred.reject( buildReject( error, options ) );
      } else {
        try {
          harvest.addVersion( storedBasket, sharedBasket.version, sharedBasket.tag );
          harvestDb.insert( storedBasket, sharedBasket.id, function( insertError, document ) {
            if ( insertError ) {
              deferred.reject( buildReject( insertError, options ) );
            } else {
              try {
                storedBasket._rev = document.rev;
                deferred.resolve( harvest.getSharedBasket( storedBasket, sharedBasket.tag ) );
              } catch ( getSharedBasketError ) {
                deferred.reject( buildReject( getSharedBasketError, options ) );
              }
            }
          } );
        } catch ( getError ) {
          deferred.reject( buildReject( getError, options ) );
        }
      }
    } );

  } catch ( error ) {
    deferred.reject( buildReject( error, options ) );
  }

  return deferred.promise;
};
