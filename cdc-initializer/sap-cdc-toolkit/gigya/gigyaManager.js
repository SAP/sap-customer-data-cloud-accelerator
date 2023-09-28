/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import SiteConfigurator from '../configurator/siteConfigurator.js'

class GigyaManager {
  constructor(userKey, secret) {
    this.userKey = userKey
    this.secret = secret
  }

  async getDataCenterFromSite(site) {
    const siteConfigurator = new SiteConfigurator(this.userKey, this.secret)
    return await siteConfigurator.getSiteConfig(site, 'us1')
  }
}

export default GigyaManager
