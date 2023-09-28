/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import UrlBuilder from '../../gigya/urlBuilder.js'
import client from '../../gigya/client.js'
import generateErrorResponse from '../../errors/generateErrorResponse.js'
import { stringToJson } from '../objectHelper.js'

class Webhook {
  static #ERROR_MSG_GET_CONFIG = 'Error getting webhooks'
  static #ERROR_MSG_SET_CONFIG = 'Error setting webhooks'
  static #NAMESPACE = 'accounts'
  #credentials
  #site
  #dataCenter

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
  }

  async get() {
    const url = UrlBuilder.buildUrl(Webhook.#NAMESPACE, this.#dataCenter, Webhook.getGetWebhookEndpoint())
    const res = await client.post(url, this.#getWebhookParameters(this.#site)).catch(function (error) {
      return generateErrorResponse(error, Webhook.#ERROR_MSG_GET_CONFIG)
    })
    return res.data
  }

  async set(site, dataCenter, body) {
    const url = UrlBuilder.buildUrl(Webhook.#NAMESPACE, dataCenter, Webhook.getSetWebhookEndpoint())
    const res = await client.post(url, this.#setWebhookParameters(site, body)).catch(function (error) {
      return generateErrorResponse(error, Webhook.#ERROR_MSG_SET_CONFIG)
    })
    return res.data
  }

  async copy(destinationSite, destinationSiteConfiguration, options) {
    let response = await this.get()

    if (response.errorCode === 0) {
      response = await this.copyWebhooks(destinationSite, destinationSiteConfiguration.dataCenter, response, options)
    }
    stringToJson(response, 'context')

    return response
  }

  #getWebhookParameters(apiKey) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.#credentials.userKey
    parameters.secret = this.#credentials.secret
    parameters.context = JSON.stringify({ id: 'webhook', targetApiKey: apiKey })
    return parameters
  }

  #setWebhookParameters(apiKey, body) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.#credentials.userKey
    parameters.secret = this.#credentials.secret
    parameters.url = body.url
    parameters.events = JSON.stringify(body.events)
    parameters.name = body.name
    parameters.active = body.active
    if (body.headers) {
      parameters.headers = JSON.stringify(body.headers)
    }
    parameters.version = body.version
    parameters.context = JSON.stringify({ id: 'webhook_' + body.name, targetApiKey: apiKey })
    return parameters
  }

  static getGetWebhookEndpoint() {
    return `${Webhook.#NAMESPACE}.webhooks.getAll`
  }

  static getSetWebhookEndpoint() {
    return `${Webhook.#NAMESPACE}.webhooks.set`
  }

  async copyWebhooks(destinationSite, dataCenter, response, options) {
    const promises = []
    for (const webhook of options.getOptions().branches) {
      if (webhook.value) {
        promises.push(this.#copyWebhook(destinationSite, dataCenter, webhook.name, response))
      }
    }
    return Promise.all(promises)
  }

  async #copyWebhook(destinationSite, dataCenter, name, response) {
    const webhook = response.webhooks.find((wb) => {
      return wb.name === name
    })
    return this.set(destinationSite, dataCenter, webhook)
  }
}

export default Webhook
