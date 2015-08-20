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

var getBaskets = require( '../lib/getBaskets' );

// Stop the Tests from interfering with each other by returning clones of the fixtures
function loadTestResource( location ) {
	return _.cloneDeep( require( location ) );
}

var successfulHarvestDb = {
	view: function( designDocument, view, params, callback ) {
		callback( null, {
			rows: [
				{ basket: true },
				{ basket: true }
			]
		} );
	}
};

var failedHarvestDb = {
	view: function( designDocument, view, params, callback ) {
		callback( 'An error has occurred', null );
	}
};

var harvest = {
	getSharedBasket: function() {
		return {};
	}
};

describe( 'LIB: getBaskets', function() {

	it( 'getBaskets should throw an error if there is no options object', function() {
		return getBaskets( harvest, successfulHarvestDb ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid options' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'getBaskets should throw an error if we are unable to make a search based on options passed in', function() {
		var options = {};
		return getBaskets( harvest, successfulHarvestDb, options ).then( function() {}, function( error ) {
			error.should.have.property( 'error' ).that.is.an.instanceof( TypeError );
			error.error.message.should.equal( 'invalid keys within options' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'getBaskets should reject if the design document throws an error', function() {
		return getBaskets( harvest, failedHarvestDb, loadTestResource( './fixtures/searchWithPin' ) ).then( function() {}, function( error ) {
			error.error.should.equal( 'An error has occurred' );
			error.should.have.property( 'origin' ).that.is.equal( 'pluginHarvest' );
		} );
	} );

	it( 'getBaskets should call the all_baskets::by_pin design document if pin is passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithPin' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'all_baskets', 'by_pin', { key: '1234' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the all_baskets::by_email design document if email is passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithEmail' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'all_baskets', 'by_email', { key: 'person@domain.com' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the all_baskets::by_telephone design document if telephone is passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithTelephone' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'all_baskets', 'by_telephone', { key: '01234567890' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the all_baskets::by_family_name design document if telephone is passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithFamilyName' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'all_baskets', 'by_family_name', { key: 'test' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the phone_baskets::by_created_at design document if type is passed in and equals phone', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithPhoneType' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'phone_baskets', 'by_created_at', { startkey: '2015-01-01T00:00:00Z', endkey: '2016-01-01T00:00:00Z' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the phone_baskets::by_created_at design document even if timestamps not passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, { type: 'phone' } );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'phone_baskets', 'by_created_at' ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the email_baskets::by_created_at design document if type is passed in and equals email', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, loadTestResource( './fixtures/searchWithEmailType' ) );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'email_baskets', 'by_created_at', { startkey: '2015-01-01T00:00:00Z', endkey: '2016-01-01T00:00:00Z' } ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

	it( 'getBaskets should call the email_baskets::by_created_at design document even if timestamps not passed in', function( done ) {
		sinon.spy( successfulHarvestDb, 'view' );
		getBaskets( harvest, successfulHarvestDb, { type: 'email' } );
		successfulHarvestDb.view.should.be.calledOnce;
		successfulHarvestDb.view.calledWith( 'email_baskets', 'by_created_at' ).should.be.ok;
		successfulHarvestDb.view.restore();
		done();
	} );

} );