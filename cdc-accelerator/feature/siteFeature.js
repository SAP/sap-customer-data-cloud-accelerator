/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import SiteConfigurator from '../sap-cdc-toolkit/configurator/siteConfigurator.js'
import Feature from '../core/feature.js'
import { Operations, SITES_DIRECTORY, SRC_DIRECTORY, BUILD_DIRECTORY } from '../core/constants.js'
import path from 'path'

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
        for (const siteInfo of sites) {
            const baseFolder = path.join(SRC_DIRECTORY, siteInfo.partnerName, SITES_DIRECTORY)
            this.createDirectoryIfNotExists(baseFolder)
            // If apiKey has baseDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteInfo.baseDomain ? `\n${siteInfo.baseDomain} - ${siteInfo.apiKey}` : `\n${siteInfo.apiKey}`
            console.log(msg)

            const siteConfig = await this.#getSiteConfig(siteInfo.apiKey)
            const siteFolder = path.join(baseFolder, siteInfo.baseDomain)
            await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, baseFolder, {
                operation: Operations.init,
                args: [siteInfo.apiKey, siteConfig, siteFolder],
            })
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
        for (const siteInfo of sites) {
            const baseFolder = path.join(SRC_DIRECTORY, siteInfo.partnerName, SITES_DIRECTORY)
            const siteFolder = path.join(baseFolder, siteInfo.baseDomain)
            const msg = siteInfo.baseDomain ? `\n${siteInfo.baseDomain} - ${siteInfo.apiKey}` : `\n${siteInfo.apiKey}`
            console.log(msg)
            await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, baseFolder, { operation: Operations.reset, args: [siteFolder] })
        }
        return true
    }

    async build(featureName) {
        // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
        const allSitePaths = await this.getLocalSitePaths(SRC_DIRECTORY)
        const sitePaths = allSitePaths.filter((sitePath) => sitePath.includes(path.join(path.sep, SITES_DIRECTORY)))
        for (const sitePath of sitePaths) {
            console.log(`\n${sitePath}`)
            await this.executeOperationOnFeature(this.#features, featureName, undefined, sitePath, { operation: Operations.build, args: [sitePath] })
        }
        return true
    }

    async deploy(sites, featureName) {
        for (const siteInfo of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteInfo.baseDomain ? `\n${siteInfo.baseDomain} - ${siteInfo.apiKey}` : `\n${siteInfo.apiKey}`
            console.log(msg)

            const siteFolder = path.join(BUILD_DIRECTORY, siteInfo.partnerName, SITES_DIRECTORY, siteInfo.baseDomain)
            const siteConfig = await this.#getSiteConfig(siteInfo.apiKey)
            await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, siteFolder, {
                operation: Operations.deploy,
                args: [siteInfo.apiKey, siteConfig, siteFolder],
            })
        }
        return true
    }
}
