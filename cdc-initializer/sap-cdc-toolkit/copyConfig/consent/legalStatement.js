/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import UrlBuilder from '../../gigya/urlBuilder.js'
import client from '../../gigya/client.js'
import generateErrorResponse from '../../errors/generateErrorResponse.js'
import { stringToJson } from '../objectHelper.js'

class LegalStatement {
  static #ERROR_MSG_GET_CONFIG = 'Error getting legal statements'
  static #ERROR_MSG_SET_CONFIG = 'Error setting legal statements'
  static #NAMESPACE = 'accounts'
  #credentials
  #site
  #dataCenter

  constructor(credentials, site, dataCenter) {
    this.#credentials = credentials
    this.#site = site
    this.#dataCenter = dataCenter
  }

  async get(consentId, language) {
    const url = UrlBuilder.buildUrl(LegalStatement.#NAMESPACE, this.#dataCenter, LegalStatement.getGetLegalStatementEndpoint())
    const res = await client.post(url, this.#getLegalStatementParameters(this.#site, consentId, language)).catch(function (error) {
      return generateErrorResponse(error, LegalStatement.#ERROR_MSG_GET_CONFIG)
    })
    return res.data
  }

  async set(site, dataCenter, consentId, language, legalStatements) {
    const url = UrlBuilder.buildUrl(LegalStatement.#NAMESPACE, dataCenter, LegalStatement.getSetLegalStatementEndpoint())
    const res = await client.post(url, this.#setLegalStatementParameters(site, consentId, language, legalStatements)).catch(function (error) {
      return generateErrorResponse(error, LegalStatement.#ERROR_MSG_SET_CONFIG)
    })
    return res.data
  }

  async copy(destinationSite, destinationSiteConfiguration, consentId, consentLanguages) {
    const promises = []
    for (const language of consentLanguages) {
      promises.push(this.#copyLegalStatement(destinationSite, destinationSiteConfiguration.dataCenter, consentId, language))
    }
    const responses = await Promise.all(promises)
    stringToJson(responses, 'context')
    return responses
  }

  async #copyLegalStatement(destinationSite, dataCenter, consentId, language) {
    let response = await this.get(consentId, language)
    if (response.errorCode === 0) {
      this.removeLegalStatementsWithStatus(response.legalStatements, 'Historic')
      response = await this.set(destinationSite, dataCenter, consentId, language, response.legalStatements)
    }
    return response
  }

  removeLegalStatementsWithStatus(legalStatements, status) {
    const type = LegalStatement.#getLegalStatementType(legalStatements)
    if (!type) {
      return
    }
    const statementsToDelete = []
    for (const statements of Object.keys(legalStatements[type])) {
      if (legalStatements[type][statements].LegalStatementStatus === status) {
        statementsToDelete.push(statements)
      }
    }
    for (const statementToDelete of statementsToDelete) {
      delete legalStatements[type][statementToDelete]
    }
    if (statementsToDelete.length > 0) {
      // to avoid that minDocVersion references a deleted ${status} version
      legalStatements.minDocVersion = legalStatements.publishedDocVersion
      legalStatements.currentDocVersion = legalStatements.publishedDocVersion
    }
  }

  static #getLegalStatementType(legalStatement) {
    let type
    if (legalStatement.dates) {
      type = 'dates'
    } else if (legalStatement.versions) {
      type = 'versions'
    }
    return type
  }

  #getLegalStatementParameters(apiKey, consentId, language) {
    const parameters = Object.assign({})
    parameters.apiKey = apiKey
    parameters.userKey = this.#credentials.userKey
    parameters.secret = this.#credentials.secret
    parameters.consentId = consentId
    parameters.lang = language
    parameters.context = JSON.stringify({ id: `consent_legalStatement_${consentId}_${language}`, targetApiKey: apiKey })
    return parameters
  }

  #setLegalStatementParameters(apiKey, consentId, language, legalStatements) {
    const parameters = Object.assign({}, this.#getLegalStatementParameters(apiKey, consentId, language))
    parameters.legalStatements = JSON.stringify(legalStatements)
    return parameters
  }

  static getGetLegalStatementEndpoint() {
    return `${LegalStatement.#NAMESPACE}.getLegalStatements`
  }

  static getSetLegalStatementEndpoint() {
    return `${LegalStatement.#NAMESPACE}.setLegalStatements`
  }
}

export default LegalStatement
