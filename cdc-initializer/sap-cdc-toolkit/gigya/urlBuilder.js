/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


class UrlBuilder {
  static buildUrl(namespace, dataCenter, endpoint) {
    const protocol = 'https'
    const domain = 'gigya.com'
    return `${protocol}://${namespace}.${dataCenter}.${domain}/${endpoint}`
  }
}

export default UrlBuilder
