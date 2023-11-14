import { CONFIG_FILENAME, Operations } from './constants.js'
import fs from 'fs'
import SitesCache from './sitesCache.js'

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
                return JSON.parse(fs.readFileSync(CONFIG_FILENAME, { encoding: 'utf8' }))
            default:
                throw new Error('The environment is not supported')
        }
    }

    static async loadCache(credentials) {
        await SitesCache.load(credentials)
    }

    static getSites(operation, environment) {
        const sites = []
        const apiKeys = this.#getConfiguration(operation, environment)
        for (const apiKeyObj of apiKeys) {
            const siteInfo = SitesCache.getSiteInfo(apiKeyObj.apiKey)
            if (siteInfo) {
                sites.push(siteInfo)
            }
        }
        return sites
    }
}
