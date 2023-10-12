/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import SiteConfigurator from '../sap-cdc-toolkit/configurator/siteConfigurator.js'
import Feature from './feature.js'
import { Operations } from './constants.js'
import FolderManager from './folderManager.js'
import SitesCache from './sitesCache.js'

export default class SiteFeature extends Feature {
    #features = []

    constructor(credentials) {
        super(credentials)
    }

    register(feature) {
        this.#features.push(feature)
    }

    getFeatures() {
        return this.#features
    }

    async init(sites, featureName) {
        await SitesCache.init(this.credentials)
        for (const { apiKey, siteDomain = '' } of sites) {
            const baseFolder = await FolderManager.getSiteBaseFolder(Operations.init, apiKey)
            this.createDirectoryIfNotExists(baseFolder)
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteConfig = await this.#getSiteConfig(apiKey)
            const siteFolder = await FolderManager.getSiteFolder(Operations.init, apiKey)
            await this.executeOperationOnFeature(this.#features, featureName, baseFolder, { operation: Operations.init, args: [apiKey, siteConfig, siteFolder] })
        }
        return true
    }

    async #getSiteConfig(apiKey) {
        const siteConfigurator = new SiteConfigurator(this.credentials.userKey, this.credentials.secret)
        const siteConfig = await siteConfigurator.getSiteConfig(apiKey, 'us1')
        if (siteConfig.errorCode) {
            throw new Error(JSON.stringify(siteConfig))
        }
        return siteConfig
    }

    async reset(sites, featureName) {
        SitesCache.load()
        for (const { apiKey, siteDomain = '' } of sites) {
            const baseFolder = await FolderManager.getSiteBaseFolder(Operations.reset, apiKey)
            const siteFolder = await FolderManager.getSiteFolder(Operations.reset, apiKey)
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)
            await this.executeOperationOnFeature(this.#features, featureName, baseFolder, { operation: Operations.reset, args: [siteFolder] })
        }
        return true
    }

    async build(featureName) {
        SitesCache.load()
        // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
        const sitePaths = await this.getAllLocalSitePaths()
        for (const sitePath of sitePaths) {
            console.log(`\n${sitePath}`)
            await this.executeOperationOnFeature(this.#features, featureName, sitePath, { operation: Operations.build, args: [sitePath] })
        }
        return true
    }

    async deploy(sites, featureName) {
        SitesCache.load()
        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteFolder = await FolderManager.getSiteFolder(Operations.deploy, apiKey)
            const siteConfig = await this.#getSiteConfig(apiKey)
            await this.executeOperationOnFeature(this.#features, featureName, siteFolder, { operation: Operations.deploy, args: [apiKey, siteConfig, siteFolder] })
        }
        return true
    }
}
