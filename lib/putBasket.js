/* jslint node: true */
'use strict';

var _ = require( 'lodash' );
var Q = require( 'q' );
var buildReject = require( './buildReject' );

module.exports = function PutBasket( harvest, harvestDb, options ) {

	var deferred = Q.defer();

	try {

		if( !options ) {
			throw new TypeError( 'invalid options' );
		}

		if( !options.id  || !_.isString( options.id ) ) {
			throw new TypeError( 'invalid options.id' );
		}

		if( !options.tag  || !_.isString( options.tag ) ) {
			throw new TypeError( 'invalid options.tag' );
		}

		// The shared basket is in effect all the options passed in but lets keep both names for consistency for both our Hapi plugins and Harvest
		var sharedBasket = options;

		// *****************************************************************************************
		// Interaction Flow
		// 1. Get a stored basket out of the harvest database with the requested id
		// 2. Get Harvest to work out the differences between the current shared basket and Stored basket
		// 3. Store this updated stored basket back into the harvest db
		// 4. Get an updated shared basket to pass back
		// ******************************************************************************************
		harvestDb.get( sharedBasket.id, function( error, storedBasket ) {

			if( error ) {
				deferred.reject( buildReject( error, options ) );
			} else {
				harvest.saveBasket( sharedBasket, storedBasket );
				harvestDb.insert( storedBasket, sharedBasket.id, function( error, document ) {
					if( error ) {
						deferred.reject( buildReject( error, options ) );
					} else {
						// Update the revision from the Couch/Nano reply
						storedBasket._rev = document.rev;
						deferred.resolve( harvest.getSharedBasket( storedBasket, sharedBasket.tag ) );
					}
				} );
			}

		} );

	} catch ( error ) {
		deferred.reject( buildReject( error, options ) );
	}

	return deferred.promise;
};
