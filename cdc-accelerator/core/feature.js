/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import { SRC_DIRECTORY, BUILD_DIRECTORY, SITES_DIRECTORY } from './constants.js'
import fs from 'fs'
import readline from 'readline'
import path from 'path'

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
            const workingDirectory = this.#calculateWorkingDirectory(directory, feature)
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

    #calculateWorkingDirectory(directory, feature) {
        let workingDirectory = directory
        if (!workingDirectory.endsWith(SITES_DIRECTORY)) {
            workingDirectory = path.join(directory, feature.getName())
        }
        if (fs.existsSync(workingDirectory)) {
            return workingDirectory
        } else if (directory.startsWith(BUILD_DIRECTORY)) {
            const srcWorkingDirectory = workingDirectory.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
            if (fs.existsSync(srcWorkingDirectory)) {
                return srcWorkingDirectory
            }
        }
        return workingDirectory
    }

    async getFiles(dir) {
        const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
        const files = await Promise.all(
            dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name)
                return dirent.isDirectory() ? this.getFiles(res) : res
            }),
        )
        return Array.prototype.concat(...files)
    }

    async getAllLocalSitePaths() {
        const buildPaths = await this.getLocalSitePaths(BUILD_DIRECTORY)
        const srcPaths = await this.getLocalSitePaths(SRC_DIRECTORY)
        const set = new Set(buildPaths)
        srcPaths.forEach((path) => {
            set.add(path.replace(SRC_DIRECTORY, BUILD_DIRECTORY))
        })
        return Array.from(set)
    }

    async getLocalSitePaths(baseDirectory) {
        const paths = await this.getFiles(baseDirectory)
        const pathSep = path.sep
        const sites = new Set()
        for (const path of paths) {
            const baseIdx = path.indexOf(baseDirectory)
            if (baseIdx < 0) {
                continue
            }
            let startIdx = path.indexOf(SITES_DIRECTORY)
            if (startIdx > -1) {
                startIdx += SITES_DIRECTORY.length
                const endIdx = path.indexOf(pathSep, startIdx)
                if (endIdx > -1) {
                    sites.add(path.substring(baseIdx, endIdx))
                }
            }
        }
        return Array.from(sites)
    }
}