/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import SiteConfigurator from '../configurator/siteConfigurator.js'
import Sorter from './sorter.js'

class ParentChildSorter extends Sorter {
  #siteConfigurator

  constructor(credentials) {
    super()
    this.#siteConfigurator = new SiteConfigurator(credentials.userKey, credentials.secret)
  }

  async sort(arrayOfValues) {
    const parentArray = []
    const childArray = []
    for (const apiKey of arrayOfValues) {
      const siteInfo = await this.#getSiteInformation(apiKey)
      const apiKeyIsChild = this.#isChildSite(siteInfo, apiKey)
      apiKeyIsChild ? childArray.push(apiKey) : parentArray.push(apiKey)
    }
    return [parentArray, childArray]
  }

  async #getSiteInformation(apiKey) {
    const response = await this.#siteConfigurator.getSiteConfig(apiKey, 'us1')
    return response.errorCode === 0 ? Promise.resolve(response) : Promise.reject(response)
  }

  #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }
}

export default ParentChildSorter
