/**
 * Re-usable block of code for our promise rejections
 * @param  {Error} error   An error object
 * @param  {Object} context The data passed into the function where the promise rejection occurs.
 * @return {Object}         Our promise rejection schema.
 */
module.exports = function( error, context ) {
	return {
		error: error,
		origin: 'pluginHarvest',
		data: context
	};
};