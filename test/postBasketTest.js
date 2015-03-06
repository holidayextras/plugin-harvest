/* jslint node: true */
/* jshint -W030 */
'use strict';

var _ = require( 'lodash' );
var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
chai.use( chaiAsPromised );
var should;
should = require( 'chai' ).should();
var sinon = require( 'sinon' );

var postBasket = require( '../lib/postBasket' );

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource( location ) {
	return _.cloneDeep( require( location ) );
}

var successfulHarvestDb = {
	insert: function( document, callback ) {
		callback( null, {} );
	}
};

var failedHarvestDb = {
	insert: function( id, callback ) {
		callback( 'An error has occurred', null );
	}
};

var harvest = {
	createBasket: function() {
		return {};
	},
	getSharedBasket: function() {
		return {};
	}
};

describe( 'LIB: postBasket', function() {

	it( 'postBasket should throw an error if there is no options object', function() {
		return postBasket( harvest, successfulHarvestDb ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasket should throw an error if there is no options.tag', function() {
		return postBasket( harvest, successfulHarvestDb, {} ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.tag' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasket should reject if the document store throws an error', function() {
		return postBasket( harvest, failedHarvestDb, loadTestResource( './fixtures/requestWithIdAndTag' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasket should ask Harvest to create a basket', function( done ) {
		sinon.spy( harvest, 'createBasket' );
		postBasket( harvest, successfulHarvestDb, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvest.createBasket.calledOnce.should.be.true;
		harvest.createBasket.restore();
		done();
	} );

	it( 'postBasket should insert a basket into the document store', function( done ) {
		sinon.spy( successfulHarvestDb, 'insert' );
		postBasket( harvest, successfulHarvestDb, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		successfulHarvestDb.insert.calledOnce.should.be.true;
		successfulHarvestDb.insert.restore();
		done();
	} );

	it( 'postBasket should ask Harvest to get a shared basket based on the basket stored in the document store', function( done ) {
		sinon.spy( harvest, 'getSharedBasket' );
		postBasket( harvest, successfulHarvestDb, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvest.getSharedBasket.calledOnce.should.be.true;
		harvest.getSharedBasket.restore();
		done();
	} );

} );