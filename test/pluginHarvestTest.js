/* eslint no-unused-expressions:0 */
'use strict'

const Hapi = require('@hapi/hapi')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.use(require('sinon-chai'))
const expect = chai.expect
const rewire = require('rewire')

const pluginHarvest = rewire('../lib/pluginHarvest')

// declare our variables upfront or jshint will start
// bitching about should being defined but unused
let server
let plugin

describe('LIB: pluginHarvest', function () {
  before(async function () {
    // need to start up a server
    server = new Hapi.Server()
    server.methods.getService = function () {
      return {
        protocol: 'http',
        hostname: 'localhost',
        port: 5984,
        authentication: {
          username: 'test',
          password: 'test'
        }
      }
    }
    // and then register this plugin to that server along with soe demo secureKeys
    await server.register(pluginHarvest)

    plugin = server.plugins['plugin-harvest']
  })

  it('should allow us to access the plugin off the hapi server', function () {
    expect(plugin).to.not.be.undefined
  })
})
