/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import SiteFinderPaginated from '../sap-cdc-toolkit/search/siteFinderPaginated.js'

export default class SitesCache {
    static cache = []

    static async #init(credentials, configuration) {
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
        if (configuration.deploy) {
            configuration.deploy.forEach((item) => sourceSites.add(item))
        }
        return Array.from(sourceSites)
    }

    static async load(credentials, configuration) {
        if (!this.isCacheUpdated(configuration)) {
            await SitesCache.#init(credentials, configuration)
        } else {
            SitesCache.cache = Array.isArray(configuration.cache) ? configuration.cache : [configuration.cache]
        }
        return SitesCache.cache
    }

    static getSiteInfo(_apiKey) {
        return SitesCache.cache.find(({ apiKey }) => apiKey === _apiKey)
    }

    static isCacheUpdated(configuration) {
        if (!configuration?.cache) {
            return false
        }
        let updated = true
        if (configuration.source) {
            configuration.source.forEach((entry) => {
                updated &= configuration.cache.some(({ apiKey }) => {
                    return entry.apiKey === apiKey
                })
            })
        }

        if (updated && configuration.deploy) {
            configuration.deploy.forEach((entry) => {
                updated &= configuration.cache.some(({ apiKey }) => {
                    return entry.apiKey === apiKey
                })
            })
        }
        return updated ? true : false
    }
}
