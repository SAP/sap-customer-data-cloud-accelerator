/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import Feature from './feature'
import FolderManager from './folderManager'
import path from 'path'

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
        for (const { apiKey } of sites) {
            const baseDirectory = await this.folderManager.getPartnerFolder('init', apiKey)
            this.createDirectoryIfNotExists(baseDirectory)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: 'init', args: [baseDirectory] })
        }
        return true
    }

    async reset(sites, featureName) {
        for (const { apiKey } of sites) {
            const baseDirectory = await this.folderManager.getPartnerFolder('reset', apiKey)
            console.log(`\n${apiKey}`)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: 'reset', args: [baseDirectory] })
        }
        return true
    }

    async build(featureName) {
        // Get all directories in src/ that are not features and check if they have features inside
        const sitePaths = await this.getAllLocalSitePaths()
        for (const sitePath of sitePaths) {
            const partnerPath = PartnerFeature.getPartnerPath(sitePath)
            console.log(`\n${partnerPath}`)
            await this.executeOperationOnFeature(this.#features, featureName, partnerPath, { operation: 'build', args: [partnerPath] })
        }
        return true
    }

    static getPartnerPath(sitePath) {
        const endIdx = sitePath.indexOf(path.join('/', FolderManager.SITES_DIRECTORY))
        if (endIdx < 0) {
            throw new Error(`Unexpected site path ${sitePath}`)
        }
        return sitePath.substring(0, endIdx)
    }

    async deploy(sites, featureName) {
        for (const { apiKey } of sites) {
            const baseDirectory = await this.folderManager.getPartnerFolder('deploy', apiKey)
            this.createDirectoryIfNotExists(baseDirectory)
            await this.executeOperationOnFeature(this.#features, featureName, baseDirectory, { operation: 'deploy', args: [baseDirectory] })
        }
        return true
    }
}
