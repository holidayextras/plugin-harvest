'use strict';

var getBasket = require( './getBasket' );
var getBaskets = require( './getBaskets' );
var postBasket = require( './postBasket' );
var putBasket = require( './putBasket' );
var postBasketVersion = require( './postBasketVersion' );
var url = require( 'url' );

var Harvest = require( 'harvest' );

exports.register = function( server, pluginOptions, next ) {

  var config = server.methods.getService( 'harvest' );

  // If we have authentication credentials then lets do some http basic auth
  if ( config.authentication ) {
    config.auth = config.authentication.username + ':' + config.authentication.password;
  }

  // Register the Harvest Database using url format to set up the connection details
  var Nano = require( 'nano' )( url.format( config ) );
  var harvestDb = Nano.db.use( 'harvest' );

  server.expose( 'getBasket', function( options ) {
    return getBasket( Harvest, harvestDb, options );
  } );

  server.expose( 'getBaskets', function( options ) {
    return getBaskets( Harvest, harvestDb, options );
  } );

  server.expose( 'postBasket', function( options ) {
    return postBasket( Harvest, harvestDb, options );
  } );

  server.expose( 'putBasket', function( options ) {
    return putBasket( Harvest, harvestDb, options );
  } );

  server.expose( 'postBasketVersion', function( options ) {
    return postBasketVersion( Harvest, harvestDb, options );
  } );

  next();
};

exports.register.attributes = {
  pkg: require( '../package.json' )
};
