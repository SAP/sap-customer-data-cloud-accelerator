/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import SiteFinderPaginated from '../sap-cdc-toolkit/search/siteFinderPaginated.js'
import { CONFIG_FILENAME, Operations } from './constants.js'
import fs from 'fs'

export default class SitesCache {
    static cache = []

    static async init(credentials) {
        if (SitesCache.cache.length > 0) {
            return
        }
        const parallelRequestsAllowed = 9999999999
        const configSites = SitesCache.#readAllSitesFromConfiguration()
        const siteFinderPaginated = new SiteFinderPaginated(credentials, parallelRequestsAllowed)
        let response = await siteFinderPaginated.getFirstPage()
        SitesCache.cache.push(...response.filter((r) => configSites.find((s) => s.apiKey === r.apiKey)))
        while ((response = await siteFinderPaginated.getNextPage()) !== undefined) {
            SitesCache.cache.push(...response.filter((r) => configSites.find((s) => s.apiKey === r.apiKey)))
        }
        SitesCache.#writeCacheToFile()
    }

    static #readAllSitesFromConfiguration() {
        const configuration = SitesCache.getConfiguration()
        const sourceSites = new Set(configuration.source)
        const deploySites = Array.isArray(configuration.deploy) ? configuration.deploy : [configuration.deploy]
        deploySites.forEach((item) => sourceSites.add(item))
        return Array.from(sourceSites)
    }

    static load() {
        const config = SitesCache.getConfiguration()
        if (!config?.cache) {
            throw new Error(`Cannot load accelerator cache. Please execute operation ${Operations.init} to create it.`)
        }
        SitesCache.cache = Array.isArray(config.cache) ? config.cache : [config.cache]
    }

    static getConfiguration() {
        return JSON.parse(fs.readFileSync(CONFIG_FILENAME, { encoding: 'utf8' }))
    }

    static getSiteInfo(_apiKey) {
        return SitesCache.cache.find(({ apiKey }) => apiKey === _apiKey)
    }

    static #writeCacheToFile() {
        const configFilePath = CONFIG_FILENAME
        const configContent = JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf8' }))
        configContent['cache'] = SitesCache.cache
        fs.writeFileSync(configFilePath, JSON.stringify(configContent, null, 4))
    }
}
