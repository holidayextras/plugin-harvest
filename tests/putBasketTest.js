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

var putBasket = require( '../lib/putBasket' );

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource( location ) {
	return _.cloneDeep( require( location ) );
}

var harvestDbWithSuccessfulGetAndInsert = {
	get: function( id, callback ) {
		callback( null, {} );
	},
	insert: function( document, id, callback ) {
		callback( null, {} );
	}
};

var harvestDbWithSuccessfulGetAndFailedInsert = {
	get: function( id, callback ) {
		callback( null, {} );
	},
	insert: function( document, id, callback ) {
		callback( 'An error has occurred inserting document', null );
	}
};

var harvestDbWithFailedGet = {
	get: function( id, callback ) {
		callback( 'An error has occurred getting document', null );
	}
};

var harvest = {
	getSharedBasket: function() {
		return {};
	},
	saveBasket: function() {
		return {};
	}
};

describe( 'LIB: putBasket', function() {

	it( 'putBasket should throw an error if there is no options object', function() {
		return putBasket( harvest, harvestDbWithSuccessfulGetAndInsert ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'putBasket should throw an error if there is no options.id', function() {
		return putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithTag' ) ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.id' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'putBasket should throw an error if there is no options.tag', function() {
		return putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithId' ) ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.tag' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'putBasket should reject if the document store throws an error on select', function() {
		return putBasket( harvest, harvestDbWithFailedGet, loadTestResource( './fixtures/requestWithIdAndTag' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred getting document' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'putBasket should reject if the document store throws an error on select', function() {
		return putBasket( harvest, harvestDbWithSuccessfulGetAndFailedInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred inserting document' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'putBasket should get a basket from a document store based on the current id', function( done ) {
		sinon.spy( harvestDbWithSuccessfulGetAndInsert, 'get' );
		putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvestDbWithSuccessfulGetAndInsert.get.calledOnce.should.be.true;
		harvestDbWithSuccessfulGetAndInsert.get.restore();
		done();
	} );

	it( 'putBasket should ask Harvest to save a basket that will get the changed details', function( done ) {
		sinon.spy( harvest, 'saveBasket' );
		putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvest.saveBasket.calledOnce.should.be.true;
		harvest.saveBasket.restore();
		done();
	} );

	it( 'putBasket should insert the basket to the document store', function( done ) {
		sinon.spy( harvestDbWithSuccessfulGetAndInsert, 'insert' );
		putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvestDbWithSuccessfulGetAndInsert.insert.calledOnce.should.be.true;
		harvestDbWithSuccessfulGetAndInsert.insert.restore();
		done();
	} );

	it( 'putBasket should ask Harvest to get a shared basket based on the basket that has been stored in the document store', function( done ) {
		sinon.spy( harvest, 'getSharedBasket' );
		putBasket( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) );
		harvest.getSharedBasket.calledOnce.should.be.true;
		harvest.getSharedBasket.restore();
		done();
	} );

} );