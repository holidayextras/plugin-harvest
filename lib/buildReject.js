'use strict'
module.exports = function (error, context) {
  return {
    error,
    origin: 'pluginHarvest',
    data: context
  }
}
