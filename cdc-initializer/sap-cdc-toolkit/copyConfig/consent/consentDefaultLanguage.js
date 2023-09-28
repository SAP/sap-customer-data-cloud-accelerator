/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import UrlBuilder from '../../gigya/urlBuilder.js'
import client from '../../gigya/client.js'
import generateErrorResponse from '../../errors/generateErrorResponse.js'

class ConsentDefaultLanguage {
  static #ERROR_MSG_SET_CONFIG = 'Error setting consent default language'
  static #NAMESPACE = 'accounts'
  #credentials
  #site
  #dataCenter

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
  }

  async set(site, dataCenter, body) {
    const url = UrlBuilder.buildUrl(ConsentDefaultLanguage.#NAMESPACE, dataCenter, ConsentDefaultLanguage.getSetConsentDefaultLanguageEndpoint())
    const res = await client.post(url, this.#setConsentDefaultLanguageParameters(site, body)).catch(function (error) {
      return generateErrorResponse(error, ConsentDefaultLanguage.#ERROR_MSG_SET_CONFIG)
    })
    return res.data
  }

  #setConsentDefaultLanguageParameters(apiKey, body) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.#credentials.userKey
    parameters.secret = this.#credentials.secret
    parameters.consentId = ConsentDefaultLanguage.#getConsentId(body.preferences)
    parameters.lang = body.preferences[parameters.consentId].defaultLang
    parameters.context = JSON.stringify({ id: `consent_consentDefaultLanguage_${parameters.consentId}`, targetApiKey: apiKey })
    return parameters
  }

  static getSetConsentDefaultLanguageEndpoint() {
    return `${ConsentDefaultLanguage.#NAMESPACE}.setConsentDefaultLang`
  }

  static #getConsentId(consent) {
    return Object.keys(consent)[0]
  }
}

export default ConsentDefaultLanguage
