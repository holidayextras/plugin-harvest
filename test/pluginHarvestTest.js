/* eslint no-unused-expressions:0 */
'use strict';

var Hapi = require( 'hapi' );
var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
chai.use( chaiAsPromised );
var expect = chai.expect;
var sinon = require( 'sinon' );
var rewire = require( 'rewire' );
var Q = require( 'q' );

var pluginHarvest = rewire( '../lib/pluginHarvest' );

// declare our variables upfront or jshint will start
// bitching about should being defined but unused
var server;
var plugin;

describe( 'LIB: pluginHarvest', function() {
  var pluginFunction;

  before( function( done ) {

    // need to start up a server
    server = new Hapi.Server();
    server.methods.getService = function() {
      return {
        protocol: 'http',
        hostname: 'localhost',
        port: 5984,
        authentication: {
          username: 'test',
          password: 'test'
        }
      };
    };
    // and then register this plugin to that server along with soe demo secureKeys
    server.pack.register( {
      plugin: pluginHarvest,
      options: {}
    }, function() {
      // give easy access to our plugin
      plugin = server.plugins['plugin-harvest'];
      done();
    } );

    pluginFunction = function() {
      return Q.resolve();
    };
  } );

  it( 'should allow us to access the plugin off the hapi server', function() {
    expect( plugin ).to.not.be.undefined;
  } );

  it( 'should expose getBasket as a function', function() {
    pluginHarvest.__set__( 'getBasket', pluginFunction );
    var getBasketSpy = sinon.spy( pluginFunction );
    return plugin.getBasket().then( function() {
      expect( plugin.getBasket ).to.be.a( 'function' );
      expect( getBasketSpy ).to.be.calledOnce;
    } );
  } );

  it( 'should expose getBaskets as a function', function() {
    pluginHarvest.__set__( 'getBaskets', pluginFunction );
    var getBasketsSpy = sinon.spy( pluginFunction );
    return plugin.getBaskets().then( function() {
      expect( plugin.getBaskets ).to.be.a( 'function' );
      expect( getBasketsSpy ).to.be.calledOnce;
    } );
  } );

  it( 'should expose postBasket as a function', function() {
    pluginHarvest.__set__( 'postBasket', pluginFunction );
    var postBasketSpy = sinon.spy( pluginFunction );
    return plugin.postBasket().then( function() {
      expect( plugin.postBasket ).to.be.a( 'function' );
      expect( postBasketSpy ).to.be.calledOnce;
    } );
  } );

  it( 'should expose putBasket as a function', function() {
    pluginHarvest.__set__( 'putBasket', pluginFunction );
    var putBasketSpy = sinon.spy( pluginFunction );
    return plugin.putBasket().then( function() {
      expect( plugin.putBasket ).to.be.a( 'function' );
      expect( putBasketSpy ).to.be.calledOnce;
    } );
  } );

  it( 'should expose postBasketVersion as a function', function() {
    pluginHarvest.__set__( 'postBasketVersion', pluginFunction );
    var postBasketVersionSpy = sinon.spy( pluginFunction );
    return plugin.postBasketVersion().then( function() {
      expect( plugin.postBasketVersion ).to.be.a( 'function' );
      expect( postBasketVersionSpy ).to.be.calledOnce;
    } );
  } );

} );
