/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Site from './site.js'
import SiteConfigurator from '../configurator/siteConfigurator.js'
import SiteMigrator from './siteMigrator.js'

class SiteManager {
  constructor(credentials) {
    this.credentials = credentials
    this.siteService = new Site(credentials.partnerID, credentials.userKey, credentials.secret)
    this.siteMigrator = new SiteMigrator(credentials.userKey, credentials.secret)
  }

  async create(siteHierarchy) {
    //console.log(`Received request to create ${JSON.stringify(siteHierarchy)}`)

    const promises = []
    for (let i = 0; i < siteHierarchy.sites.length; ++i) {
      promises[i] = this.#createSiteHierarchy(siteHierarchy.sites[i])
    }
    return Promise.all(promises)
      .then((siteHierarchyCreatedResponses) => {
        if (this.#isAnyResponseError(siteHierarchyCreatedResponses)) {
          return this.#rollbackHierarchies(siteHierarchyCreatedResponses)
        }
        return siteHierarchyCreatedResponses.flat()
      })
      .then((rollbackHierarchiesResponses) => {
        // nothing to do, just making sure that rollback was finished
        return rollbackHierarchiesResponses
      })
      .catch((error) => {
        console.log(`SiteManager.create error ${error}`)
        return error
      })
  }

  async #createSiteHierarchy(hierarchy) {
    const responses = []
    let response = await this.#createParent(hierarchy)
    response = this.#enrichResponse(response.data, hierarchy.tempId, false)
    responses.push(response)

    if (this.#isSuccessful(response)) {
      const childSites = hierarchy.childSites
      if (childSites && childSites.length > 0) {
        return Promise.all(this.#createChildren(hierarchy.childSites, response.apiKey)).then((childrenCreatedResponses) => {
          responses.push(...childrenCreatedResponses)
          return responses
        })
      }
    }
    return responses
  }

  async #createParent(parentSite) {
    return this.#createSite(parentSite)
  }

  #createChildren(childSites, parentApiKey) {
    const promises = []
    for (const site of childSites) {
      promises.push(this.#createSiteAndConnect(site, parentApiKey))
    }
    return promises
  }

  async #createSiteAndConnect(site, parentApiKey) {
    const siteConfigurator = new SiteConfigurator(this.credentials.userKey, this.credentials.secret)
    let childResponse = (await this.#createSite(site)).data
    childResponse = this.#enrichResponse(childResponse, site.tempId, true)
    if (this.#isSuccessful(childResponse)) {
      const scResponse = (await siteConfigurator.connect(parentApiKey, childResponse.apiKey, site.dataCenter)).data
      if (!this.#isSuccessful(scResponse)) {
        childResponse = this.#mergeErrorResponse(childResponse, scResponse)
      }
    }
    return childResponse
  }

  async #createSite(site) {
    const body = {
      baseDomain: site.baseDomain,
      description: site.description,
      dataCenter: site.dataCenter,
    }
    //console.log(`Creating site ${site.baseDomain}`)
    const response = await this.siteService.create(body)
    if (this.#isSuccessful(response.data)) {
      await this.siteMigrator.migrateConsentFlow(response.data.apiKey, site.dataCenter)
    }
    return response
  }

  #enrichResponse(response, id, isChildSite) {
    const resp = Object.assign({}, response)
    resp.tempId = id
    resp.deleted = false
    resp.endpoint = Site.getCreateEndpoint()
    this.#addIsChildSiteToResponse(resp, isChildSite)
    return resp
  }

  // The function addApiKeyToResponse is used to set the apiKey in the response.
  // It will allow to map the responses to the requests performed in parallel, used in the delete sites feature
  #addApiKeyToResponse(response, apiKey) {
    response.apiKey = apiKey
  }

  // The function addIsChildSiteToResponse is used to set in the response if it belongs to a parent or child site.
  // It will be useful to speed up the sites rollback, passing only the parent apiKey to deleteSites method
  #addIsChildSiteToResponse(response, isChild) {
    response.isChildSite = isChild
  }

  #isSuccessful(response) {
    return response.errorCode === 0
  }

  #shouldBeRollbacked(response) {
    return response.errorCode === 0 || (response.errorCode !== 0 && response.tempId && response.apiKey && response.apiKey.length > 0)
  }

  async deleteSites(targetApiKeys) {
    const responses = []
    for (const site of targetApiKeys) {
      responses.push(this.#deleteSite(site))
    }
    return Promise.all(responses.flat())
      .then((deleteResponses) => {
        //console.log(`Delete sites responses ${JSON.stringify(deleteResponses)}`)
        return deleteResponses.flat()
      })
      .catch((error) => {
        console.log(`Delete sites error ${error}`)
        return error
      })
  }

  async #deleteSite(targetApiKey) {
    //console.log(`Deleting site ${targetApiKey}`)
    const responses = []
    const siteConfigurator = new SiteConfigurator(this.credentials.userKey, this.credentials.secret)

    const siteConfig = await siteConfigurator.getSiteConfig(targetApiKey, 'us1')
    if (this.#isSiteAlreadyDeleted(siteConfig) || !this.#isSuccessful(siteConfig)) {
      this.#addApiKeyToResponse(siteConfig, targetApiKey)
      responses.push(siteConfig)
      return Promise.resolve(responses)
    }

    const dataCenter = siteConfig.dataCenter
    const siteMembers = siteConfig.siteGroupConfig.members

    // Delete site members
    if (siteMembers && siteMembers.length > 0) {
      const memberResponses = await this.#siteMembersDeleter(siteMembers, dataCenter)
      responses.push(...memberResponses.flat())
    }

    // Delete parent site
    const response = await this.siteService.delete(targetApiKey, dataCenter)
    this.#addApiKeyToResponse(response, targetApiKey)
    responses.push(response)
    return responses
  }

  async #siteMembersDeleter(siteMembers, dataCenter) {
    const promises = []
    for (let i = 0; i < siteMembers.length; ++i) {
      const site = siteMembers[i]
      promises[i] = this.#deleteSiteMember(site, dataCenter)
    }
    const responses = []
    return Promise.all(promises).then((response) => {
      responses.push(response)
      return responses
    })
  }

  async #deleteSiteMember(site, dataCenter) {
    const response = await this.siteService.delete(site, dataCenter)
    this.#addApiKeyToResponse(response, site)
    return response
  }

  #isSiteAlreadyDeleted(res) {
    return res.errorDetails === 'Site was deleted' && res.statusCode === 403
  }

  #mergeErrorResponse(siteResponse, siteConfiguratorResponse) {
    const response = Object.assign({}, siteResponse)
    response.statusCode = siteConfiguratorResponse.statusCode
    response.statusReason = siteConfiguratorResponse.statusReason
    response.errorCode = siteConfiguratorResponse.errorCode
    response.errorMessage = siteConfiguratorResponse.errorMessage
    response.errorDetails = siteConfiguratorResponse.errorDetails
    response.time = siteConfiguratorResponse.time
    response.endpoint = SiteConfigurator.getSetEndpoint()
    return response
  }

  #isAnyResponseError(responsesArray) {
    for (const responses of responsesArray) {
      for (const response of responses) {
        if (!this.#isSuccessful(response)) {
          return true
        }
      }
    }
    return false
  }

  async #rollbackHierarchies(hierarchiesResponses) {
    const promises = []
    for (let i = 0; i < hierarchiesResponses.length; ++i) {
      promises[i] = this.#rollbackCreatedSites(hierarchiesResponses[i])
    }
    return Promise.all(promises)
      .then((responses) => {
        //console.log(`SiteManager.rollbackHierarchies then ${JSON.stringify(responses)}`)
        return responses.flat()
      })
      .catch((error) => {
        console.log(`SiteManager.rollbackHierarchies catch ${error}`)
        return error
      })
  }

  async #rollbackCreatedSites(responses) {
    const parentSiteResponse = responses.find((response) => {
      return response.isChildSite === false
    })
    if (this.#shouldBeRollbacked(parentSiteResponse)) {
      const deleteResponses = await this.deleteSites([parentSiteResponse.apiKey])
      for (const response of deleteResponses.flat()) {
        if (this.#isSuccessful(response)) {
          this.#findSiteInResponsesAndMarkItAsDeleted(responses, response.apiKey)
        }
      }
    }
    return responses
  }

  #findSiteInResponsesAndMarkItAsDeleted(responses, apiKey) {
    const response = responses.find((res) => {
      return res.apiKey === apiKey && res.deleted === false
    })
    if (response) {
      response.deleted = true
    }
  }
}

export default SiteManager
