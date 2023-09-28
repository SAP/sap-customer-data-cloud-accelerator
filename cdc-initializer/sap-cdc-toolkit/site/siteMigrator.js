/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import client from '../gigya/client.js'
import UrlBuilder from '../gigya/urlBuilder.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'

class SiteMigrator {
  static #ERROR_MSG_MIGRATE = 'Error migrating site consents'
  static #NAMESPACE = 'accounts'

  constructor(userKey, secret) {
    this.userKey = userKey
    this.secret = secret
  }

  async migrateConsentFlow(apiKey, dataCenter) {
    const url = UrlBuilder.buildUrl(SiteMigrator.#NAMESPACE, dataCenter, SiteMigrator.#getMigrateEndpoint())
    const payload = this.#createMigrateConsentFlowPayload(apiKey)
    return client.post(url, payload).catch(function (error) {
      return generateErrorResponse(error, SiteMigrator.#ERROR_MSG_MIGRATE)
    })
  }

  static #getMigrateEndpoint() {
    return `${SiteMigrator.#NAMESPACE}.migrateConsentFlow`
  }

  #createMigrateConsentFlowPayload(apiKey) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.userKey
    parameters.secret = this.secret
    parameters.MigrateSite = true
    return parameters
  }
}

export default SiteMigrator
