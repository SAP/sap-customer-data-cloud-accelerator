/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import UrlBuilder from '../../gigya/urlBuilder.js'
import client from '../../gigya/client.js'
import generateErrorResponse from '../../errors/generateErrorResponse.js'
import { stringToJson } from '../objectHelper.js'

class Extension {
  static #ERROR_MSG_GET_CONFIG = 'Error getting extensions'
  static #ERROR_MSG_SET_CONFIG = 'Error setting extensions'
  static #ERROR_MSG_CREATE_CONFIG = 'Error creating extensions'
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
    const url = UrlBuilder.buildUrl(Extension.#NAMESPACE, this.#dataCenter, Extension.#getGetExtensionEndpoint())
    const res = await client.post(url, this.#getExtensionParameters(this.#site)).catch(function (error) {
      return generateErrorResponse(error, Extension.#ERROR_MSG_GET_CONFIG)
    })
    return res.data
  }

  async set(site, dataCenter, body) {
    const url = UrlBuilder.buildUrl(Extension.#NAMESPACE, dataCenter, Extension.#getSetExtensionEndpoint())
    const res = await client.post(url, this.#setExtensionParameters(site, body)).catch(function (error) {
      return generateErrorResponse(error, Extension.#ERROR_MSG_SET_CONFIG)
    })
    return res.data
  }

  async create(site, dataCenter, body) {
    const url = UrlBuilder.buildUrl(Extension.#NAMESPACE, dataCenter, Extension.#getCreateExtensionEndpoint())
    const res = await client.post(url, this.#createExtensionParameters(site, body)).catch(function (error) {
      return generateErrorResponse(error, Extension.#ERROR_MSG_CREATE_CONFIG)
    })
    return res.data
  }

  async copy(destinationSite, destinationSiteConfiguration, options) {
    let response = await this.get()
    if (response.errorCode === 0) {
      response = await this.copyExtensions(destinationSite, destinationSiteConfiguration, response, options)
    }
    stringToJson(response, 'context')
    return response
  }

  #getExtensionParameters(apiKey) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.#credentials.userKey
    parameters.secret = this.#credentials.secret
    parameters.context = JSON.stringify({ id: 'extensions', targetApiKey: apiKey })
    return parameters
  }

  #createExtensionParameters(apiKey, body) {
    const parameters = Object.assign({}, this.#getExtensionParameters(apiKey))
    if (body.extensionFuncUrl) {
      parameters.extensionFuncUrl = body.extensionFuncUrl
    }
    if (body.extensionPoint) {
      parameters.extensionPoint = body.extensionPoint
    }
    if (body.friendlyName) {
      parameters.friendlyName = body.friendlyName
    }
    if (body.context) {
      parameters.context = body.context
    } else {
      parameters.context = JSON.stringify({ id: 'extensions_' + body.extensionPoint, targetApiKey: apiKey })
    }
    return parameters
  }

  #setExtensionParameters(apiKey, body) {
    const parameters = Object.assign({}, this.#createExtensionParameters(apiKey, body))
    parameters.extensionId = body.id
    if (body.headers) {
      parameters.headers = JSON.stringify(body.headers)
    }
    if (body.enabled !== undefined) {
      parameters.enabled = body.enabled
    }
    if (body.timeout) {
      parameters.timeout = body.timeout
    }
    if (body.fallback) {
      parameters.fallback = body.fallback
    }
    if (body.integration) {
      parameters.integration = body.integration
    }
    if (body.description) {
      parameters.description = body.description
    }
    return parameters
  }

  static #getGetExtensionEndpoint() {
    return `${Extension.#NAMESPACE}.extensions.list`
  }

  static #getSetExtensionEndpoint() {
    return `${Extension.#NAMESPACE}.extensions.modify`
  }

  static #getCreateExtensionEndpoint() {
    return `${Extension.#NAMESPACE}.extensions.create`
  }

  async copyExtensions(destinationSite, destinationSiteConfiguration, response, options) {
    const promises = []
    const destinationSiteExtensions = await this.#getSiteExtensions(destinationSite, destinationSiteConfiguration.dataCenter)
    if (destinationSiteExtensions.errorCode !== 0) {
      return [destinationSiteExtensions]
    }
    const isParentSite = !this.#isChildSite(destinationSiteConfiguration, destinationSite)
    for (const extension of options.getOptions().branches) {
      if (extension.value) {
        if (isParentSite) {
          promises.push(this.#copyExtensionToParentSite(destinationSite, destinationSiteConfiguration, extension.name, response, destinationSiteExtensions))
        } else {
          promises.push(this.#copyExtensionToChildSite(destinationSite, destinationSiteConfiguration, extension.name, response, destinationSiteExtensions))
        }
      }
    }
    return Promise.all(promises)
  }

  async #getSiteExtensions(destinationSite, dataCenter) {
    return new Extension(this.#credentials, destinationSite, dataCenter).get()
  }

  async #copyExtensionToParentSite(destinationSite, destinationSiteConfiguration, extensionPoint, sourceSiteExtensions, destinationSiteExtensions) {
    const sourceSiteExtension = Extension.#findExtension(sourceSiteExtensions, extensionPoint)
    const destinationSiteExtension = Extension.#findExtension(destinationSiteExtensions, extensionPoint)
    if (destinationSiteExtension) {
      // we are doing a modify the id must be the one from the destination extension
      sourceSiteExtension.id = destinationSiteExtension.id
      return this.set(destinationSite, destinationSiteConfiguration.dataCenter, sourceSiteExtension)
    } else {
      const payload = {
        enabled: sourceSiteExtension.enabled,
        headers: sourceSiteExtension.headers,
        timeout: sourceSiteExtension.timeout,
        fallback: sourceSiteExtension.fallback,
        integration: sourceSiteExtension.integration,
        description: sourceSiteExtension.description,
      }
      return this.#createExtension(destinationSite, destinationSiteConfiguration.dataCenter, sourceSiteExtension, payload)
    }
  }

  async #createExtension(destinationSite, dataCenter, sourceSiteExtension, payload) {
    let response = await this.create(destinationSite, dataCenter, sourceSiteExtension)
    if (response.errorCode === 0) {
      // modify what can't be specified during create
      payload.id = response.result.id
      payload.context = response.context
      response = await this.set(destinationSite, dataCenter, payload)
    }
    return response
  }

  async #copyExtensionToChildSite(destinationSite, destinationSiteConfiguration, extensionPoint, sourceSiteExtensions, destinationSiteExtensions) {
    const sourceSiteExtension = Extension.#findExtension(sourceSiteExtensions, extensionPoint)
    const destinationSiteExtension = Extension.#findExtension(destinationSiteExtensions, extensionPoint)
    if (destinationSiteExtension) {
      // we are doing a modify, the id must be the one from the destination extension
      sourceSiteExtension.id = destinationSiteExtension.id
      return this.set(destinationSite, destinationSiteConfiguration.dataCenter, Extension.#createPayloadForModifyingChildSite(sourceSiteExtension, destinationSite))
    } else {
      return this.#createExtension(
        destinationSite,
        destinationSiteConfiguration.dataCenter,
        sourceSiteExtension,
        Extension.#createPayloadForModifyingChildSite(sourceSiteExtension, destinationSite)
      )
    }
  }

  static #findExtension(extensions, extensionPoint) {
    return extensions.result.find((ext) => {
      return ext.extensionPoint === extensionPoint
    })
  }

  static #createPayloadForModifyingChildSite(extension, apiKey) {
    // Only 'Enabled' and 'ExtensionFuncUrl' parameters are allowed when modifying child site
    return {
      id: extension.id,
      enabled: extension.enabled,
      extensionFuncUrl: extension.extensionFuncUrl,
      context: JSON.stringify({ id: 'extensions_' + extension.extensionPoint, targetApiKey: apiKey }),
    }
  }

  #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }
}

export default Extension
