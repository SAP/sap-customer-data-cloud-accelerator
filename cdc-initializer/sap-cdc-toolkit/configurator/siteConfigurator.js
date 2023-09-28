/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import client from '../gigya/client.js'
import UrlBuilder from '../gigya/urlBuilder.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'

class SiteConfigurator {
  static ERROR_MSG_CONFIG = 'Invalid ApiKey parameter'
  static #NAMESPACE = 'admin'

  constructor(userKey, secret) {
    this.userKey = userKey
    this.secret = secret
  }

  async connect(parentApiKey, childApiKey, dataCenter) {
    const url = UrlBuilder.buildUrl(SiteConfigurator.#NAMESPACE, dataCenter, SiteConfigurator.getSetEndpoint())
    const body = this.#createRequestBody(parentApiKey, childApiKey)
    return client.post(url, body).catch(function (error) {
      return generateErrorResponse(error, SiteConfigurator.ERROR_MSG_CONFIG)
    })
  }

  #createRequestBody(parentApiKey, childApiKey) {
    return {
      apiKey: childApiKey,
      siteGroupOwner: parentApiKey,
      userKey: this.userKey,
      secret: this.secret,
    }
  }

  static getSetEndpoint() {
    return 'admin.setSiteConfig'
  }

  static getGetEndpoint() {
    return 'admin.getSiteConfig'
  }

  async getSiteConfig(apiKey, dataCenter) {
    const url = UrlBuilder.buildUrl(SiteConfigurator.#NAMESPACE, dataCenter, SiteConfigurator.getGetEndpoint())

    const response = await client.post(url, this.#siteConfigParameters(apiKey, this.userKey, this.secret)).catch(function (error) {
      //console.log(`error=${JSON.stringify(error)}`)
      return generateErrorResponse(error, SiteConfigurator.ERROR_MSG_CONFIG)
    })
    return response.data
  }

  #siteConfigParameters(apiKey, userKey, secret) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = userKey
    parameters.secret = secret
    parameters.includeSiteGroupConfig = true
    parameters.includeGlobalConf = true
    return parameters
  }
}

export default SiteConfigurator
