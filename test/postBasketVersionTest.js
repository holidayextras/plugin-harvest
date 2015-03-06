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

var postBasketVersion = require( '../lib/postBasketVersion' );

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
	addVersion: function() {
		return {};
	}
};

describe( 'LIB: postBasketVersion', function() {

	it( 'postBasketVersion should throw an error if there is no options object', function() {
		return postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should throw an error if there is no options.id', function() {
		return postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithTag' ) ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.id' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should throw an error if there is no options.tag', function() {
		return postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithId' ) ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.tag' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should throw an error if there is no options.version', function() {
		return postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTag' ) ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options.version' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should reject if the document store throws an error on select', function() {
		return postBasketVersion( harvest, harvestDbWithFailedGet, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred getting document' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should reject if the document store throws an error on select', function() {
		return postBasketVersion( harvest, harvestDbWithSuccessfulGetAndFailedInsert, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred inserting document' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'postBasketVersion should get a basket from a document store based on the current id', function( done ) {
		sinon.spy( harvestDbWithSuccessfulGetAndInsert, 'get' );
		postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) );
		harvestDbWithSuccessfulGetAndInsert.get.calledOnce.should.be.true;
		harvestDbWithSuccessfulGetAndInsert.get.restore();
		done();
	} );

	it( 'postBasketVersion should ask Harvest to add a version to the basket', function( done ) {
		sinon.spy( harvest, 'addVersion' );
		postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) );
		harvest.addVersion.calledOnce.should.be.true;
		harvest.addVersion.restore();
		done();
	} );

	it( 'postBasketVersion should insert the basket to the document store', function( done ) {
		sinon.spy( harvestDbWithSuccessfulGetAndInsert, 'insert' );
		postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) );
		harvestDbWithSuccessfulGetAndInsert.insert.calledOnce.should.be.true;
		harvestDbWithSuccessfulGetAndInsert.insert.restore();
		done();
	} );

	it( 'postBasketVersion should ask Harvest to get a shared basket based on the basket that has been stored in the document store', function( done ) {
		sinon.spy( harvest, 'getSharedBasket' );
		postBasketVersion( harvest, harvestDbWithSuccessfulGetAndInsert, loadTestResource( './fixtures/requestWithIdAndTagAndVersion' ) );
		harvest.getSharedBasket.calledOnce.should.be.true;
		harvest.getSharedBasket.restore();
		done();
	} );

} );