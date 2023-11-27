/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import SiteFinderPaginated from '../sap-cdc-toolkit/search/siteFinderPaginated.js'

export default class SitesCache {
    static cache = []

    static async #init(credentials, configuration) {
        if (SitesCache.cache.length > 0) {
            return
        }
        const parallelRequestsAllowed = 9999999999
        const configSites = SitesCache.#readAllSitesFromConfiguration(configuration)
        const siteFinderPaginated = new SiteFinderPaginated(credentials, parallelRequestsAllowed)
        let response = await siteFinderPaginated.getFirstPage()
        SitesCache.cache.push(...response.filter((r) => configSites.find((s) => s.apiKey === r.apiKey)))
        while ((response = await siteFinderPaginated.getNextPage()) !== undefined) {
            SitesCache.cache.push(...response.filter((r) => configSites.find((s) => s.apiKey === r.apiKey)))
        }
    }

    static #readAllSitesFromConfiguration(configuration) {
        const sourceSites = new Set(configuration.source)
        const deploySites = Array.isArray(configuration.deploy) ? configuration.deploy : [configuration.deploy]
        deploySites.forEach((item) => sourceSites.add(item))
        return Array.from(sourceSites)
    }

    static async load(credentials, configuration) {
        if (!configuration?.cache) {
            await SitesCache.#init(credentials, configuration)
        } else {
            SitesCache.cache = Array.isArray(configuration.cache) ? configuration.cache : [configuration.cache]
        }
        return SitesCache.cache
    }

    static getSiteInfo(_apiKey) {
        return SitesCache.cache.find(({ apiKey }) => apiKey === _apiKey)
    }
}
