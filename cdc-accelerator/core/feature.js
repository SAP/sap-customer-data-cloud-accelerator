/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import { SRC_DIRECTORY, BUILD_DIRECTORY, SITES_DIRECTORY, Operations } from './constants.js'
import fs from 'fs'
import readline from 'readline'
import path from 'path'
import Directory from './directory.js'

export default class Feature {
    credentials

    constructor(credentials) {
        this.credentials = credentials
    }

    createDirectoryIfNotExists(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }
    }

    createDirectory(directory) {
        if (fs.existsSync(directory)) {
            throw new Error(`The "${directory}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`)
        }
        fs.mkdirSync(directory, { recursive: true })
    }

    deleteDirectory(directory) {
        if (fs.existsSync(directory)) {
            fs.rmSync(directory, { recursive: true, force: true })
        }
    }

    clearDirectoryContents(directory) {
        this.deleteDirectory(directory)
        fs.mkdirSync(directory, { recursive: true })
    }

    static isEqualCaseInsensitive(str1, str2) {
        return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0
    }

    copyFileFromSrcToBuild(featurePath, file) {
        const fileContent = JSON.parse(fs.readFileSync(path.join(featurePath, file), { encoding: 'utf8' }))
        const buildBasePath = featurePath.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
        fs.writeFileSync(path.join(buildBasePath, file), JSON.stringify(fileContent, null, 4))
    }

    async executeOperationOnFeature(features, featureName, allowedFeatures, directory, runnable) {
        let anyFeatureExecuted = false
        for (const feature of features) {
            if (this.#isFeatureFilteredOut(featureName, feature.constructor.name, allowedFeatures)) {
                continue
            }
            const workingDirectory = this.#calculateWorkingDirectory(directory, feature, runnable.operation)
            if (fs.existsSync(workingDirectory)) {
                process.stdout.write(`- ${feature.getName()}: `)
                await feature[runnable.operation](...runnable.args) // the same as -> feature.init(apiKey, siteConfig, siteDomain)
                anyFeatureExecuted = true
                readline.clearLine(process.stdout, 0)
                readline.cursorTo(process.stdout, 0)
                console.log(`- ${feature.getName()}: \x1b[32m%s\x1b[0m`, `Done`)
            } else {
                console.log(`- ${feature.getName()}: %s`, `Skip`)
            }
        }
        return anyFeatureExecuted
    }

    #isFeatureFilteredOut(singleFeatureToExecute, currentFeatureName, allowedFeatures) {
        return (
            (singleFeatureToExecute && !Feature.isEqualCaseInsensitive(singleFeatureToExecute, currentFeatureName)) ||
            (allowedFeatures && !allowedFeatures.find((f) => Feature.isEqualCaseInsensitive(f, currentFeatureName)))
        )
    }

    #calculateWorkingDirectory(directory, feature, operation) {
        let workingDirectory = directory
        if (operation === Operations.build && feature.getType() === 'PartnerFeature') {
            workingDirectory = path.join(directory, feature.getName())
        } else if (!workingDirectory.endsWith(SITES_DIRECTORY) && feature.getType() !== 'PartnerFeature') {
            workingDirectory = path.join(directory, feature.getName())
        }
        return workingDirectory
    }

    async getLocalSitePaths(baseDirectory) {
        const filePaths = await Directory.read(baseDirectory)
        const sites = new Set()
        for (const filePath of filePaths) {
            const baseIdx = filePath.indexOf(baseDirectory)
            if (baseIdx < 0) {
                continue
            }
            this.#processPath(filePath, baseDirectory, baseIdx, sites)
        }
        return Array.from(sites)
    }

    #processPath(filePath, baseDirectory, baseIdx, sites) {
        const pathSep = path.sep
        let startIdx = filePath.indexOf(SITES_DIRECTORY)
        if (startIdx > -1) {
            // SiteFeature
            startIdx += SITES_DIRECTORY.length
            const endIdx = filePath.indexOf(pathSep, startIdx)
            if (endIdx > -1) {
                sites.add(filePath.substring(baseIdx, endIdx))
            }
        } else {
            // PartnerFeature
            let partnerIdx = filePath.indexOf(pathSep, baseIdx + baseDirectory.length)
            if (partnerIdx > -1) {
                const endIdx = filePath.indexOf(pathSep, partnerIdx + 1)
                if (endIdx > -1) {
                    sites.add(filePath.substring(baseIdx, endIdx))
                }
            }
        }
    }
}
