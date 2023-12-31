/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import Feature from '../core/feature.js'
import path from 'path'
import { Operations, SITES_DIRECTORY, BUILD_DIRECTORY, SRC_DIRECTORY } from '../core/constants.js'

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
        const processedPartners = new Set()
        for (const siteInfo of sites) {
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            console.log(`\n${siteInfo.partnerName} - ${siteInfo.apiKey}`)
            const partnerDirectory = path.join(SRC_DIRECTORY, siteInfo.partnerName)
            this.createDirectoryIfNotExists(partnerDirectory)
            const anyFeatureExecuted = await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, partnerDirectory, {
                operation: Operations.init,
                args: [partnerDirectory, siteInfo],
            })
            if (anyFeatureExecuted) {
                processedPartners.add(siteInfo.partnerName)
            }
        }
        return true
    }

    async reset(sites, featureName) {
        const processedPartners = new Set()
        for (const siteInfo of sites) {
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            console.log(`\n${siteInfo.partnerName} - ${siteInfo.apiKey}`)
            const partnerDirectory = path.join(SRC_DIRECTORY, siteInfo.partnerName)
            const anyFeatureExecuted = await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, partnerDirectory, {
                operation: Operations.reset,
                args: [partnerDirectory],
            })
            if (anyFeatureExecuted) {
                processedPartners.add(siteInfo.partnerName)
            }
        }
        return true
    }

    async build(featureName) {
        const processedPartners = new Set()
        // Get all directories in src/ that are not features and check if they have features inside
        const sitePaths = await this.getLocalSitePaths(SRC_DIRECTORY)
        for (const sitePath of sitePaths) {
            const partnerPath = PartnerFeature.getPartnerPath(sitePath)
            if (processedPartners.has(partnerPath)) {
                continue
            }
            processedPartners.add(partnerPath)
            console.log(`\n${partnerPath}`)
            await this.executeOperationOnFeature(this.#features, featureName, undefined, partnerPath, { operation: Operations.build, args: [partnerPath] })
        }
        return true
    }

    static getPartnerPath(sitePath) {
        let endIdx = sitePath.indexOf(path.join(path.sep, SITES_DIRECTORY))
        if (endIdx === -1) {
            endIdx = sitePath.lastIndexOf(path.sep)
        }
        if (endIdx < 0) {
            throw new Error(`Unexpected site path ${sitePath}`)
        }
        return sitePath.substring(0, endIdx)
    }

    async deploy(sites, featureName) {
        const processedPartners = new Set()
        for (const siteInfo of sites) {
            if (processedPartners.has(siteInfo.partnerName)) {
                continue
            }
            console.log(`\n${siteInfo.partnerName} - ${siteInfo.apiKey}`)
            const baseDirectory = path.join(BUILD_DIRECTORY, siteInfo.partnerName)
            this.createDirectoryIfNotExists(baseDirectory)
            const anyFeatureExecuted = await this.executeOperationOnFeature(this.#features, featureName, siteInfo.features, baseDirectory, {
                operation: Operations.deploy,
                args: [baseDirectory, siteInfo],
            })
            if (anyFeatureExecuted) {
                processedPartners.add(siteInfo.partnerName)
            }
        }
        return true
    }
}
