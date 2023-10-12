/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import Feature from './feature.js'
import path from 'path'
import { Operations, SITES_DIRECTORY } from './constants.js'
import FolderManager from './folderManager.js'
import SitesCache from './sitesCache.js'

export default class PartnerFeature extends Feature {
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
        const processedPartners = new Set()
        for (const { apiKey } of sites) {
            const siteInfo = await FolderManager.getSiteInfo(apiKey)
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            processedPartners.add(siteInfo.partnerName)

            console.log(`\n${siteInfo.partnerName} - ${apiKey}`)
            const partnerDirectory = await FolderManager.getPartnerFolder(Operations.init, apiKey)
            this.createDirectoryIfNotExists(partnerDirectory)
            const baseDirectory = await FolderManager.getSiteBaseFolder(Operations.init, apiKey)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: Operations.init, args: [apiKey, siteInfo, partnerDirectory] })
        }
        return true
    }

    async reset(sites, featureName) {
        await SitesCache.load()
        const processedPartners = new Set()
        for (const { apiKey } of sites) {
            const siteInfo = await FolderManager.getSiteInfo(apiKey)
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            processedPartners.add(siteInfo.partnerName)

            console.log(`\n${siteInfo.partnerName} - ${apiKey}`)
            const partnerDirectory = await FolderManager.getPartnerFolder(Operations.reset, apiKey)
            const baseDirectory = await FolderManager.getSiteBaseFolder(Operations.reset, apiKey)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: Operations.reset, args: [partnerDirectory] })
        }
        return true
    }

    async build(featureName) {
        await SitesCache.load()
        const processedPartners = new Set()
        // Get all directories in src/ that are not features and check if they have features inside
        const sitePaths = await this.getAllLocalSitePaths()
        for (const sitePath of sitePaths) {
            const partnerPath = PartnerFeature.getPartnerPath(sitePath)
            if (processedPartners.has(partnerPath)) {
                continue
            }
            processedPartners.add(partnerPath)

            console.log(`\n${partnerPath}`)
            await this.executeOperationOnFeature(this.#features, featureName, partnerPath, { operation: Operations.build, args: [partnerPath] })
        }
        return true
    }

    static getPartnerPath(sitePath) {
        const endIdx = sitePath.indexOf(path.join('/', SITES_DIRECTORY))
        if (endIdx < 0) {
            throw new Error(`Unexpected site path ${sitePath}`)
        }
        return sitePath.substring(0, endIdx)
    }

    async deploy(sites, featureName) {
        await SitesCache.load()
        const processedPartners = new Set()
        for (const { apiKey } of sites) {
            const siteInfo = await FolderManager.getSiteInfo(apiKey)
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            processedPartners.add(siteInfo.partnerName)

            console.log(`\n${siteInfo.partnerName} - ${apiKey}`)
            const baseDirectory = await FolderManager.getPartnerFolder(Operations.deploy, apiKey)
            this.createDirectoryIfNotExists(baseDirectory)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: Operations.deploy, args: [baseDirectory] })
        }
        return true
    }
}
