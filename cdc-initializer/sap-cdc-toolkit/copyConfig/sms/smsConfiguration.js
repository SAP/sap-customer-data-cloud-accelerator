/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Sms from '../../sms/sms.js'
import { stringToJson } from '../objectHelper.js'

class SmsConfiguration {
  #credentials
  #site
  #dataCenter
  #sms

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
    this.#sms = new Sms(credentials.userKey, credentials.secret)
  }

  async get() {
    return await this.getSms().get(this.#site, this.#dataCenter)
  }

  async copy(destinationSite, destinationSiteConfiguration, option = []) {
    let response = await this.get()
    if (response.errorCode === 0) {
      response = await this.getSms().set(destinationSite, destinationSiteConfiguration.dataCenter, response.templates)
    }
    stringToJson(response, 'context')
    return response
  }

  getSms() {
    return this.#sms
  }

  static hasSmsTemplates(response) {
    return response.templates !== undefined && Object.keys(response.templates).length > 0
  }
}

export default SmsConfiguration
