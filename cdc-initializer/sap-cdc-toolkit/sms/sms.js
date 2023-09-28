/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import client from '../gigya/client.js'
import UrlBuilder from '../gigya/urlBuilder.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'
import GigyaManager from '../gigya/gigyaManager.js'

class Sms {
  static #ERROR_MSG_GET_CONFIG = 'Error getting sms templates'
  static #ERROR_MSG_SET_CONFIG = 'Error setting sms templates'
  static #NAMESPACE = 'accounts'

  constructor(userKey, secret) {
    this.userKey = userKey
    this.secret = secret
    this.gigyaManager = new GigyaManager(this.userKey, this.secret)
  }

  async get(site, dataCenter) {
    const url = UrlBuilder.buildUrl(Sms.#NAMESPACE, dataCenter, Sms.getGetSmsTemplatesEndpoint())
    const res = await client.post(url, this.#getSmsTemplatesParameters(site)).catch(function (error) {
      //console.log(`error=${error}`)
      return generateErrorResponse(error, Sms.#ERROR_MSG_GET_CONFIG)
    })

    return res.data
  }

  async getSiteSms(site) {
    const dataCenterResponse = await this.gigyaManager.getDataCenterFromSite(site)
    if (dataCenterResponse.errorCode !== 0) {
      return dataCenterResponse
    }
    return this.get(site, dataCenterResponse.dataCenter)
  }

  async set(site, dataCenter, templates) {
    const url = UrlBuilder.buildUrl(Sms.#NAMESPACE, dataCenter, Sms.getSetSmsTemplatesEndpoint())
    const res = await client.post(url, this.#setSmsTemplatesParameters(site, templates)).catch(function (error) {
      //console.log(`error=${error}`)
      return generateErrorResponse(error, Sms.#ERROR_MSG_SET_CONFIG)
    })
    return res.data
  }

  async setSiteSms(site, templates) {
    const dataCenterResponse = await this.gigyaManager.getDataCenterFromSite(site)
    if (dataCenterResponse.errorCode !== 0) {
      return dataCenterResponse
    }
    return this.set(site, dataCenterResponse.dataCenter, templates)
  }

  #getSmsTemplatesParameters(apiKey) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.userKey
    parameters.secret = this.secret
    parameters.context = JSON.stringify({ id: 'smsTemplates', targetApiKey: apiKey })
    return parameters
  }

  #setSmsTemplatesParameters(apiKey, templates) {
    const parameters = Object.assign({ templates: JSON.stringify(templates) }, this.#getSmsTemplatesParameters(apiKey))
    return parameters
  }

  static getGetSmsTemplatesEndpoint() {
    return `${Sms.#NAMESPACE}.sms.templates.get`
  }

  static getSetSmsTemplatesEndpoint() {
    return `${Sms.#NAMESPACE}.sms.templates.set`
  }
}

export default Sms
