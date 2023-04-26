'use strict'

const getBasket = require('./getBasket')
const getBaskets = require('./getBaskets')
const postBasket = require('./postBasket')
const putBasket = require('./putBasket')
const postBasketVersion = require('./postBasketVersion')
const url = require('url')

const Harvest = require('harvest')

const register = function (server, pluginOptions) {
  const config = server.methods.getService('harvest')

  // If we have authentication credentials then lets do some http basic auth
  if (config.authentication) {
    config.auth = config.authentication.username + ':' + config.authentication.password
  }

  // Register the Harvest Database using url format to set up the connection details
  const Nano = require('nano')(url.format(config))
  const harvestDb = Nano.db.use('harvest')

  server.expose('getBasket', function (options) {
    return getBasket(Harvest, harvestDb, options)
  })

  server.expose('getBaskets', function (options) {
    return getBaskets(Harvest, harvestDb, options)
  })

  server.expose('postBasket', function (options) {
    return postBasket(Harvest, harvestDb, options)
  })

  server.expose('putBasket', function (options) {
    return putBasket(Harvest, harvestDb, options)
      .fail(() => {
        return postBasket(Harvest, harvestDb, options)
      })
  })

  server.expose('postBasketVersion', function (options) {
    return postBasketVersion(Harvest, harvestDb, options)
  })
}

const pkg = require('../package.json')
const { version, name } = pkg

exports.plugin = {
  register,
  name,
  version,
  pkg
}
