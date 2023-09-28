/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import generateErrorResponse from '../../errors/generateErrorResponse.js'
import UrlBuilder from '../../gigya/urlBuilder.js'
import client from '../../gigya/client.js'
import { removePropertyFromObjectCascading, stringToJson } from '../objectHelper.js'

class Policy {
  static #NAMESPACE = 'accounts'
  static #GET_ENDPOINT = 'accounts.getPolicies'
  static #SET_ENDPOINT = 'accounts.setPolicies'
  static #ERROR_GET_POLICY_CONFIG = 'Error retrieving policy configuration'
  static #ERROR_SET_POLICY_CONFIG = 'Error setting policy configuration'

  constructor(credentials, apiKey, dataCenter) {
    this.userKey = credentials.userKey
    this.secret = credentials.secret
    this.originApiKey = apiKey
    this.originDataCenter = dataCenter
  }

  async get() {
    const url = UrlBuilder.buildUrl(Policy.#NAMESPACE, this.originDataCenter, Policy.#GET_ENDPOINT)
    const response = await client.post(url, this.#getPolicyConfigParameters(this.originApiKey)).catch(function (error) {
      return generateErrorResponse(error, Policy.#ERROR_GET_POLICY_CONFIG)
    })

    return response.data
  }

  async set(apiKey, config, targetDataCenter) {
    const url = UrlBuilder.buildUrl(Policy.#NAMESPACE, targetDataCenter, Policy.#SET_ENDPOINT)
    const response = await client.post(url, this.#setPolicyConfigParameters(apiKey, config)).catch(function (error) {
      return generateErrorResponse(error, Policy.#ERROR_SET_POLICY_CONFIG)
    })
    return response.data
  }

  async copy(targetApi, targetDataCenter, options) {
    let response = await this.get()

    if (response.errorCode === 0) {
      response = await this.copyPolicies(targetApi, targetDataCenter, response, options)
    }
    if (response.context) {
      response['context'] = response.context.replace(/&quot;/g, '"')
      stringToJson(response, 'context')
    }

    return response
  }

  async copyPolicies(destinationSite, destinationSiteConfiguration, response, options) {
    this.#cleanResponse(response)
    const filteredResponse = JSON.parse(JSON.stringify(this.#removeUnecessaryFields(response, options)))
    const isParentSite = !this.#isChildSite(destinationSiteConfiguration, destinationSite)
    if (isParentSite) {
      return this.set(destinationSite, filteredResponse, destinationSiteConfiguration.dataCenter)
    } else {
      return this.#copyPoliciesToChildSite(destinationSite, destinationSiteConfiguration.dataCenter, filteredResponse)
    }
  }

  async #copyPoliciesToChildSite(destinationSite, dataCenter, response) {
    this.#prepareAccountOptionsToChildSite(response)
    this.#prepareRegistrationToChildSite(response)
    this.#prepareTwoFactorAuthToChildSite(response)
    this.#prepareSecurityToChildSite(response)
    delete response.authentication
    delete response.passwordComplexity
    delete response.profilePhoto
    delete response.federation
    return this.set(destinationSite, response, dataCenter)
  }

  #prepareSecurityToChildSite(response) {
    if (response.security) {
      removePropertyFromObjectCascading(response.security, 'passwordChangeInterval')
      removePropertyFromObjectCascading(response.security, 'passwordHistorySize')
    }
  }

  #prepareTwoFactorAuthToChildSite(response) {
    if (response.twoFactorAuth) {
      removePropertyFromObjectCascading(response.twoFactorAuth, 'providers')
    }
  }

  #prepareRegistrationToChildSite(response) {
    if (response.registration) {
      removePropertyFromObjectCascading(response.registration, 'requireSecurityQuestion')
      removePropertyFromObjectCascading(response.registration, 'requireLoginID')
      removePropertyFromObjectCascading(response.registration, 'enforceCoppa')
    }
  }

  #prepareAccountOptionsToChildSite(response) {
    if (response.accountOptions) {
      removePropertyFromObjectCascading(response.accountOptions, 'allowUnverifiedLogin')
      removePropertyFromObjectCascading(response.accountOptions, 'preventLoginIDHarvesting')
      removePropertyFromObjectCascading(response.accountOptions, 'defaultLanguage')
      removePropertyFromObjectCascading(response.accountOptions, 'loginIdentifiers')
      removePropertyFromObjectCascading(response.accountOptions, 'loginIdentifierConflict')
    }
  }

  #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }

  #deleteOptions(response, options) {
    for (const templateInfo of options.branches) {
      if (!templateInfo.value) {
        delete response[templateInfo.id]
      }
    }
    return response
  }

  #removeUnecessaryFields(response, options) {
    if (options.branches === undefined) {
      this.#deleteOptions(response, options.options)
      return response
    } else {
      this.#deleteOptions(response, options)
      return response
    }
  }

  #cleanResponse(response) {
    delete response['rba']
    if (response['security']) {
      delete response['security'].accountLockout
      delete response['security'].captcha
      delete response['security'].ipLockout
    }
  }

  #getPolicyConfigParameters(apiKey) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.userKey
    parameters.secret = this.secret
    parameters.format = 'json'
    return parameters
  }

  #setPolicyConfigParameters(apiKey, config) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.userKey
    parameters.secret = this.secret
    if (config.accountOptions) {
      parameters.accountOptions = JSON.stringify(config.accountOptions)
      parameters.context = JSON.stringify({ id: 'accountOptions', targetApiKey: apiKey })
    }
    if (config.authentication) {
      parameters.authentication = JSON.stringify(config.authentication)
      parameters.context = JSON.stringify({ id: 'authentication', targetApiKey: apiKey })
    }
    if (config.emailNotifications) {
      parameters.emailNotifications = JSON.stringify(config.emailNotifications)
      parameters.context = JSON.stringify({ id: 'emailNotifications', targetApiKey: apiKey })
    }
    if (config.emailVerification) {
      parameters.emailVerification = JSON.stringify(config.emailVerification)
      parameters.context = JSON.stringify({ id: 'pemailVerification', targetApiKey: apiKey })
    }
    if (config.gigyaPlugins) {
      parameters.gigyaPlugins = JSON.stringify(config.gigyaPlugins)
      parameters.context = JSON.stringify({ id: 'gigyaPlugins', targetApiKey: apiKey })
    }
    if (config.passwordComplexity) {
      parameters.passwordComplexity = JSON.stringify(config.passwordComplexity)
      parameters.context = JSON.stringify({ id: 'passwordComplexity', targetApiKey: apiKey })
    }
    if (config.passwordReset) {
      parameters.passwordReset = JSON.stringify(config.passwordReset)
      parameters.context = JSON.stringify({ id: 'ppasswordReset', targetApiKey: apiKey })
    }
    if (config.profilePhoto) {
      parameters.profilePhoto = JSON.stringify(config.profilePhoto)
      parameters.context = JSON.stringify({ id: 'profilePhoto', targetApiKey: apiKey })
    }
    if (config.registration) {
      parameters.registration = JSON.stringify(config.registration)
      parameters.context = JSON.stringify({ id: 'registration', targetApiKey: apiKey })
    }
    if (config.security) {
      parameters.security = JSON.stringify(config.security)
      parameters.context = JSON.stringify({ id: 'security', targetApiKey: apiKey })
    }
    if (config.twoFactorAuth) {
      parameters.twoFactorAuth = JSON.stringify(config.twoFactorAuth)
      parameters.context = JSON.stringify({ id: 'pTwoFactorAuth', targetApiKey: apiKey })
    }
    if (config.federation) {
      parameters.federation = JSON.stringify(config.federation)
      parameters.context = JSON.stringify({ id: 'federation', targetApiKey: apiKey })
    }
    if (config.doubleOptIn) {
      parameters.doubleOptIn = JSON.stringify(config.doubleOptIn)
      parameters.context = JSON.stringify({ id: 'doubleOptIn', targetApiKey: apiKey })
    }
    if (config.preferencesCenter) {
      parameters.preferencesCenter = JSON.stringify(config.preferencesCenter)
      parameters.context = JSON.stringify({ id: 'preferencesCenter', targetApiKey: apiKey })
    }
    parameters.format = 'json'

    return parameters
  }
}

export default Policy
