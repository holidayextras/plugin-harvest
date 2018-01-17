'use strict'
module.exports = function (error, context) {
  return {
    error: error,
    origin: 'pluginHarvest',
    data: context
  }
}
