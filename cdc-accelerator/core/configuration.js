/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */

import { CONFIG_FILENAME, Operations } from './constants.js'
import SitesCache from './sitesCache.js'
import fs from 'fs'

export default class Configuration {
    static #getConfiguration(operation, environment) {
        const config = this.#getConfigurationByEnvironment(environment)
        switch (operation) {
            case Operations.init:
            case Operations.reset:
            case Operations.build:
                return config.source
            case Operations.deploy:
                return config.deploy
            default:
                throw new Error('Cannot find configuration')
        }
    }

    static #getConfigurationByEnvironment(environment) {
        switch (environment) {
            case 'dev':
            case 'qa':
            case 'prod':
            case undefined:
                return Configuration.getAllConfiguration()
            default:
                throw new Error('The environment is not supported')
        }
    }

    static getAllConfiguration() {
        return JSON.parse(fs.readFileSync(CONFIG_FILENAME, { encoding: 'utf8' }))
    }

    static isValid(operation, environment) {
        const apiKeys = this.#getConfiguration(operation, environment)
        const validApiKeys = apiKeys.filter(({ apiKey }) => apiKey.length > 0)
        return validApiKeys.length > 0 ? true : false
    }

    static #writeCacheToFile(cache) {
        const configContent = Configuration.getAllConfiguration()
        configContent['cache'] = cache
        fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(configContent, null, 4))
    }

    static async generateCache(credentials) {
        const cache = await SitesCache.load(credentials, Configuration.getAllConfiguration())
        if (!cache.length) {
            throw new Error('Cannot generate configuration cache')
        }
        Configuration.#writeCacheToFile(cache)
    }

    static getSites(operation, environment) {
        const sites = []
        const apiKeys = this.#getConfiguration(operation, environment)
        for (const apiKeyObj of apiKeys) {
            const siteInfo = SitesCache.getSiteInfo(apiKeyObj.apiKey)
            if (siteInfo) {
                siteInfo['features'] = apiKeyObj.features
                sites.push(siteInfo)
            }
        }
        return sites
    }
}
