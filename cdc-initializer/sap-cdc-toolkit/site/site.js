/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import client from '../gigya/client.js'
import UrlBuilder from '../gigya/urlBuilder.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'

class Site {
  static #ERROR_MSG_CREATE = 'Error creating site'
  static #ERROR_MSG_DELETE = 'Error deleting site'
  static #NAMESPACE = 'admin'

  constructor(partnerId, userKey, secret) {
    this.partnerId = partnerId
    this.userKey = userKey
    this.secret = secret
  }

  async create(body) {
    const url = UrlBuilder.buildUrl(Site.#NAMESPACE, body.dataCenter, Site.getCreateEndpoint())
    const bodyWithCredentials = this.#addCredentials(body)
    return client.post(url, bodyWithCredentials).catch(function (error) {
      return generateErrorResponse(error, Site.#ERROR_MSG_CREATE)
    })
  }

  static getCreateEndpoint() {
    return `${Site.#NAMESPACE}.createSite`
  }

  static getDeleteEndpoint() {
    return `${Site.#NAMESPACE}.deleteSite`
  }

  #addCredentials(body) {
    const bodyWithCredentials = Object.assign({}, body)
    bodyWithCredentials.partnerID = this.partnerId
    bodyWithCredentials.userKey = this.userKey
    bodyWithCredentials.secret = this.secret
    return bodyWithCredentials
  }

  async delete(site, dataCenter) {
    const url = UrlBuilder.buildUrl(Site.#NAMESPACE, dataCenter, Site.getDeleteEndpoint())

    // GET TOKEN
    const getDeleteTokenRes = await client.post(url, this.#deleteSiteParameters(site)).catch(function (error) {
      return generateErrorResponse(error, Site.#ERROR_MSG_DELETE)
    })
    if (getDeleteTokenRes.data.errorCode !== 0) {
      return getDeleteTokenRes.data
    }

    // DELETE SITE
    const response = await client.post(url, this.#deleteSiteParameters(site, getDeleteTokenRes.data.deleteToken)).catch(function (error) {
      return generateErrorResponse(error, Site.#ERROR_MSG_DELETE)
    })
    return response.data
  }

  #deleteSiteParameters(apiKey, deleteToken) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.userKey
    parameters.secret = this.secret

    if (deleteToken !== undefined) {
      parameters.deleteToken = deleteToken
    }
    return parameters
  }
}

export default Site
