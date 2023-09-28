/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import ConsentStatement from './consentStatement.js'
import LegalStatement from './legalStatement.js'
import { stringToJson } from '../objectHelper.js'
import { ERROR_CODE_CANNOT_CHANGE_CONSENTS_ON_CHILD_SITE, ERROR_SEVERITY_ERROR, ERROR_SEVERITY_INFO, ERROR_SEVERITY_WARNING } from '../../errors/generateErrorResponse.js'
import ConsentDefaultLanguage from './consentDefaultLanguage.js'

class ConsentConfiguration {
  #credentials
  #site
  #dataCenter
  #consentStatement
  #legalStatement
  #consentDefaultLanguage

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
    this.#consentStatement = new ConsentStatement(credentials, site, dataCenter)
    this.#legalStatement = new LegalStatement(credentials, site, dataCenter)
    this.#consentDefaultLanguage = new ConsentDefaultLanguage(credentials, site, dataCenter)
  }

  async get() {
    return this.#consentStatement.get()
  }

  async copy(destinationSite, destinationSiteConfiguration, options) {
    let responses = []
    if (options && options.value === false) {
      return responses
    }
    let response = await this.#consentStatement.get()
    if (response.errorCode === 0) {
      const consentsPayload = ConsentConfiguration.#splitConsents(response.preferences)
      responses.push(...(await this.copyConsentStatements(destinationSite, destinationSiteConfiguration, consentsPayload)))
    } else {
      responses.push(response)
    }
    responses = responses.flat()
    stringToJson(responses, 'context')
    responses = ConsentConfiguration.#addSeverityToResponses(responses)
    return responses
  }

  static #splitConsents(consents) {
    const consentsList = []
    for (const consent of Object.keys(consents)) {
      const payload = { preferences: {} }
      payload.preferences[consent] = consents[consent]
      consentsList.push(payload)
    }
    return consentsList
  }

  static #addSeverityToResponses(responses) {
    return responses.map((response) => {
      if (response.severity === undefined) {
        if (response.errorCode === 0) {
          response.severity = ERROR_SEVERITY_INFO
        } else if (response.errorCode === 400009 && response.errorDetails.startsWith('There is already legal statement for ')) {
          response.severity = ERROR_SEVERITY_WARNING
        } else if (response.errorCode !== 0) {
          response.severity = ERROR_SEVERITY_ERROR
        }
      }
      return response
    })
  }

  async copyConsentStatements(destinationSite, destinationSiteConfiguration, consentsPayload) {
    const promises = []
    for (const consentPayload of consentsPayload) {
      promises.push(this.#copyConsentStatement(destinationSite, destinationSiteConfiguration, consentPayload))
    }
    return Promise.all(promises)
  }

  async #copyConsentStatement(destinationSite, destinationSiteConfiguration, consent) {
    const responses = []
    let response
    const isParentSite = !ConsentConfiguration.#isChildSite(destinationSiteConfiguration, destinationSite)
    if (isParentSite) {
      response = await this.#consentStatement.set(destinationSite, destinationSiteConfiguration.dataCenter, consent)
      if (response.errorCode === 0 && ConsentConfiguration.#hasDefaultLanguage(consent)) {
        const defaultLanguageResponse = await this.#consentDefaultLanguage.set(destinationSite, destinationSiteConfiguration.dataCenter, consent)
        if (defaultLanguageResponse.errorCode !== 0) {
          response = defaultLanguageResponse
        }
      }
      responses.push(response)
      if (response.errorCode === 0) {
        responses.push(...(await this.#copyLegalStatements(destinationSite, destinationSiteConfiguration, consent)))
      }
    } else {
      response = await this.#copyConsentToChildSite(destinationSite, destinationSiteConfiguration.dataCenter, consent)
      responses.push(response)
    }
    return responses
  }

  static #isChildSite(siteInfo, siteApiKey) {
    return siteInfo.siteGroupOwner !== undefined && siteInfo.siteGroupOwner !== siteApiKey
  }

  static #hasDefaultLanguage(consent) {
    const consentId = ConsentConfiguration.#getConsentId(consent.preferences)
    return consent.preferences[consentId].defaultLang !== undefined
  }

  async #copyLegalStatements(destinationSite, destinationSiteConfiguration, consent) {
    const consentId = ConsentConfiguration.#getConsentId(consent.preferences)
    const consentLanguages = consent.preferences[consentId].langs
    return this.#legalStatement.copy(destinationSite, destinationSiteConfiguration, consentId, consentLanguages)
  }

  static #getConsentId(consent) {
    return Object.keys(consent)[0]
  }

  static #createConsentForChildSite(consent) {
    const childConsent = JSON.parse(JSON.stringify(consent))
    const consentId = ConsentConfiguration.#getConsentId(childConsent.preferences)
    // for a child site only the field isActive is allowed on the payload
    childConsent.preferences[consentId] = { isActive: childConsent.preferences[consentId].isActive }
    return childConsent
  }

  async #copyConsentToChildSite(destinationSite, dataCenter, consent) {
    let response
    const consentPayload = ConsentConfiguration.#createConsentForChildSite(consent)
    if (await this.#siteContainsConsent(destinationSite, dataCenter, consent)) {
      response = await this.#consentStatement.set(destinationSite, dataCenter, consentPayload)
    } else {
      response = {
        errorCode: ERROR_CODE_CANNOT_CHANGE_CONSENTS_ON_CHILD_SITE,
        errorDetails: 'Cannot change consents on child site if the consents do not exist on parent site. Please copy the consents to the parent site first.',
        errorMessage: 'Cannot copy consents to the destination site',
        statusCode: 412,
        statusReason: 'Precondition Failed',
        time: Date.now(),
        severity: ERROR_SEVERITY_WARNING,
        context: { targetApiKey: destinationSite, id: 'consent_consentStatement_' + ConsentConfiguration.#getConsentId(consent.preferences) },
      }
    }
    return response
  }

  async #siteContainsConsent(destinationSite, dataCenter, consent) {
    const destinationConsentStatement = new ConsentStatement(this.#credentials, destinationSite, dataCenter)
    const existingConsents = await destinationConsentStatement.get()
    if (existingConsents.errorCode && existingConsents.errorCode !== 0) {
      return false
    }
    const filteredConsents = Object.keys(existingConsents.preferences).filter((id) => id === ConsentConfiguration.#getConsentId(consent.preferences))
    return filteredConsents.length > 0
  }

  static hasConsents(response) {
    return Object.keys(response.preferences).length > 0
  }
}

export default ConsentConfiguration
