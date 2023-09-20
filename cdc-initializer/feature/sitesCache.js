/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import SiteFinderPaginated from '../sap-cdc-toolkit/search/SiteFinderPaginated.js'

export default class SitesCache {
    #credentials
    static cache = []
    static lastSiteCache = {}

    constructor(credentials) {
        this.#credentials = credentials
    }

    async #init() {
        const parallelRequestsAllowed = 5
        const siteFinderPaginated = new SiteFinderPaginated(this.#credentials, parallelRequestsAllowed)
        let response = await siteFinderPaginated.getFirstPage()
        SitesCache.cache.push(...response)
        while ((response = await siteFinderPaginated.getNextPage()) !== undefined) {
            SitesCache.cache.push(...response)
        }
    }

    static #cacheIsEmpty() {
        return SitesCache.cache.length === 0
    }

    async getSiteInfo(siteKey) {
        if (siteKey === SitesCache.lastSiteCache.apiKey) {
            return SitesCache.lastSiteCache
        }
        if (SitesCache.#cacheIsEmpty()) {
            await this.#init()
        }
        const info = SitesCache.cache.find(({ apiKey }) => apiKey === siteKey)
        SitesCache.lastSiteCache = info
        return info
    }
}
