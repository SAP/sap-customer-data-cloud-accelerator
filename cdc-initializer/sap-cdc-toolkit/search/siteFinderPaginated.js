/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import UrlBuilder from '../gigya/urlBuilder.js'
import client from '../gigya/client.js'
import generateErrorResponse from '../errors/generateErrorResponse.js'

class SiteFinderPaginated {
  static #NAMESPACE = 'admin'
  static #DATA_CENTER_DEFAULT = 'us1'
  #credentials
  #requestsPerPage
  #pageInfo
  #currentPage

  constructor(credentials, requestsPerPage) {
    this.#credentials = credentials
    this.#requestsPerPage = requestsPerPage
    this.#currentPage = 0
  }

  async getFirstPage() {
    const partnersResponse = await this.#getPartners()
    if (partnersResponse.errorCode === 0) {
      this.#getPageInfo(partnersResponse.partners)
      return this.getNextPage()
    }
    return Promise.reject([partnersResponse])
  }

  #getPageInfo(partners) {
    this.#pageInfo = []
    for (const partner of partners) {
      if (partner.errorCode === 0 && !partner.partner.IsCDP) {
        this.#pageInfo.push({ PartnerID: partner.partner.PartnerID, Name: partner.partner.Name })
      }
    }
  }

  #getFinalRequestIndex() {
    let finalRequest = this.#currentPage + this.#requestsPerPage
    if (finalRequest > this.#pageInfo.length) {
      finalRequest = this.#pageInfo.length
    }
    return finalRequest
  }

  async getNextPage() {
    if (this.#currentPage >= this.#pageInfo.length) {
      return undefined
    }

    const promises = []
    for (const info of this.#pageInfo.slice(this.#currentPage, this.#getFinalRequestIndex())) {
      promises.push(this.#getPagedUserEffectiveSites(info))
    }
    const responses = await Promise.all(promises)

    const sites = []
    for (const partnerSites of responses) {
      if (partnerSites.errorCode === 0) {
        this.#extractInfo(sites, partnerSites)
      } else {
        return Promise.reject([partnerSites])
      }
    }
    this.#currentPage += this.#requestsPerPage
    return sites
  }

  async #getPartners() {
    const url = UrlBuilder.buildUrl(SiteFinderPaginated.#NAMESPACE, SiteFinderPaginated.#DATA_CENTER_DEFAULT, 'admin.console.getPartners')
    const bodyWithCredentials = { userKey: this.#credentials.userKey, secret: this.#credentials.secret }
    const response = await client.post(url, bodyWithCredentials).catch(function (error) {
      return generateErrorResponse(error, 'Error getting partners')
    })
    return response.data
  }

  async #getPagedUserEffectiveSites(partnerInfo) {
    const url = UrlBuilder.buildUrl(SiteFinderPaginated.#NAMESPACE, SiteFinderPaginated.#DATA_CENTER_DEFAULT, 'admin.console.getPagedUserEffectiveSites')
    const bodyWithCredentials = {
      userKey: this.#credentials.userKey,
      secret: this.#credentials.secret,
      targetPartnerID: partnerInfo.PartnerID,
      pageSize: 1000,
      context: JSON.stringify({ partnerId: partnerInfo.PartnerID, partnerName: partnerInfo.Name }),
    }
    const response = await client.post(url, bodyWithCredentials).catch(function (error) {
      return generateErrorResponse(error, 'Error getting partner user effective sites')
    })
    return response.data
  }

  #extractInfo(sites, partnerSites) {
    for (const site of partnerSites.sites) {
      const context = JSON.parse(partnerSites.context)
      sites.push({
        apiKey: site.apiKey,
        baseDomain: site.name,
        dataCenter: site.datacenter,
        partnerId: context.partnerId,
        partnerName: context.partnerName,
      })
    }
  }
}

export default SiteFinderPaginated
