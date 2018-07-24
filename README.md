# plugin-harvest

## About

A [hapi](http://hapijs.com/) plugin to connect to a CouchDB database with encoded baskets

## Getting Started

If you want to work on this repo you will need to install the dependencies
```
$ npm install
```

## Documentation

Enables the class to be bootstrapped by a Hapi.js server this takes care of instantiating child classes and exposing them to the server.

To use the plugin we have a 4 functions to interact with a Basket: postBasket, postBasketVersion, putBasket and getBasket

### Registering with the server

This plugin conforms to the [hapijs plugin interface](http://hapijs.com/api#plugin-interface).

While bootstrapping your Hapi server, include the plugin like so:

```
server.pack.register( [
	require( 'plugin-harvest' )
], function() {
	server.start( function() {
		console.log( 'server started with plugin-harvest plugin initialised' );
	} );
} );
```

### Function: postBasket
This function creates a basket with 2 versions automatically created - an Initial version that contains the data that you pass down to it and a second version that will be named after the tag that you passed in.

After the Basket has been created it will be persisted to the CouchDb instance, and the shared representation of the basket will be returned.

```
var options = {
	tag: 'availability',
	data: {
		park: 'PB',
		agent: 'PDP01'
	}
};
return request.server.plugins['plugin-harvest'].postBasket( options );
```

This is called from the Works endpoint **baskets/(basketId)::post**.

### Function: postBasketVersion

This function will create a new version on the basket that will be named after the tag passed in and will call the version passed its 'base version'.

After the version has been created the basket will be persisted to the CouchDB instance, and the shared representation of the basket will be returned.

```
var options = {
	id: '755204ffaceb748a71522f9e550160af',
	tag: 'payment', // new tag
	version: '3ee81a' // existing version - this will be the parent of the new version
};
return request.server.plugins['plugin-harvest'].postBasketVersion( options );
```

This is called from the Works endpoint **baskets/(basketId)::put**, when you pass in the **newVersion** key with a **true** value.

**Note:** This will not update anything based on the data passed in. The idea of this is that it is the start of the journey for this 'version' of the basket. You will need to do a separate call down to the putBasket to store new data - we can revisit this functionality if this causes an issue.

### Function: putBasket

This function updates the current tag of the basket based on what has been passed in, using Harvest to work out the differences between the current and parent version.

After the differences have been calculated the basket will be persisted to the CouchDB instance, and the shared representation of the basket will be returned.

```
var options = {
	id: '755204ffaceb748a71522f9e550160af',
	tag: 'availability', // existing tag
	data: {
		park: 'PB',
		agent: 'PDP01',
		adults: 1
	}
};
return request.server.plugins['plugin-harvest'].putBasket( options );
```

This is called from the Works endpoint **baskets/(basketId)::put**, when you don't pass in a **newVersion** key.

### Function: getBasket
This function returns a basket that has been stored under its id and will take the version of the basket identified by the tag passed in.

After finding the Basket in the Couch instance the shared representation of the basket will be returned.

```
var options = {
	id: '755204ffaceb748a71522f9e550160af',
	tag: 'availability', // existing tag
};
return request.server.plugins['plugin-harvest'].getBasket( options );
```

This is called from the Works endpoint **baskets/(basketId)::get**.

### Function: getBaskets
This function calls Design Documents on the CouchDB instance to retrieve collections of baskets based on what has been passed in.
_Please note the Design Documents may need to be manually created on your local CouchDB instance_

After finding the matching baskets each basket will be returned with its shared representation.

These are all called from the Works endpoint **baskets::get**.

#### all_baskets::by_pin

Pass in a pin to search for baskets

```
var options = {
	pin: '1234'
};
return request.server.plugins['plugin-harvest'].getBaskets( options );
```

#### all_baskets::by_email

Pass in a email to search for baskets

```
var options = {
	email: 'person@domain.com'
};
return request.server.plugins['plugin-harvest'].getBaskets( options );
```

#### all_baskets::by_telephone

Pass in a telephone to search for baskets

```
var options = {
	telephone: '01234567890'
};
return request.server.plugins['plugin-harvest'].getBaskets( options );
```

#### phone_baskets::by_created_at

Pass in type=phone and a since and until timestamps (in ISO date format). If timestamps not included they will default to the current time

```
var options = {
	type: 'phone'
	since: '2015-01-01T00:00:00Z',
	until: '2016-01-01T00:00:00Z'
};
return request.server.plugins['plugin-harvest'].getBaskets( options );
```

#### email_baskets::by_created_at

Pass in type=email and a since and until timestamps (in ISO date format). If timestamps not included they will default to the current time

```
var options = {
	type: 'email'
	since: '2015-01-01T00:00:00Z',
	until: '2016-01-01T00:00:00Z'
};
return request.server.plugins['plugin-harvest'].getBaskets( options );
```

## Contributing

Code is linted checked against the style guide with [make-up](https://github.com/holidayextras/make-up), running npm test will run all tests required.

## License
Copyright (c) 2015 Shortbreaks
Licensed under the MIT license.
