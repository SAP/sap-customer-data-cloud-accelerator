/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import SiteConfigurator from '../sap-cdc-toolkit/configurator/siteConfigurator'
import FolderManager from './folderManager'

export default class SiteFeature {
    credentials
    folderManager
    #features = []

    constructor(credentials) {
        this.credentials = credentials
        this.folderManager = new FolderManager(this.credentials)
    }

    register(feature) {
        this.#features.push(feature)
    }

    getFeatures() {
        return this.#features
    }

    async init(sites, featureName) {
        for (const { apiKey, siteDomain = '' } of sites) {
            const baseFolder = await this.folderManager.getSiteBaseFolder('init', apiKey)
            this.createDirectoryIfNotExists(baseFolder)
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteConfig = await this.#getSiteConfig(apiKey)
            await this.#executeOperationOnFeatures(featureName, baseFolder, { operation: 'init', args: [apiKey, siteConfig, siteDomain] })
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
        for (const { apiKey, siteDomain = '' } of sites) {
            const baseFolder = await this.folderManager.getSiteBaseFolder('reset', apiKey)
            const siteFolder = await this.folderManager.getSiteFolder('reset', apiKey)
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)
            await this.#executeOperationOnFeatures(featureName, baseFolder, { operation: 'reset', args: [siteFolder] })
        }
        return true
    }

    async build(featureName) {
        // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
        const sitePaths = await this.getAllLocalSitePaths()
        for (const sitePath of sitePaths) {
            console.log(`\n${sitePath}`)
            await this.#executeOperationOnFeatures(featureName, sitePath, { operation: 'build', args: [sitePath] })
        }
        return true
    }

    deleteDirectory(directory) {
        if (fs.existsSync(directory)) {
            fs.rmSync(directory, { recursive: true, force: true })
        }
    }

    createDirectory(directory) {
        if (fs.existsSync(directory)) {
            throw new Error(`The "${directory}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`)
        }
        fs.mkdirSync(directory, { recursive: true })
    }

    createDirectoryIfNotExists(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }
    }

    copyFileFromSrcToBuild(featurePath, file) {
        const fileContent = JSON.parse(fs.readFileSync(path.join(featurePath, file), { encoding: 'utf8' }))
        const buildBasePath = featurePath.replace(FolderManager.SRC_DIRECTORY, FolderManager.BUILD_DIRECTORY)
        fs.writeFileSync(path.join(buildBasePath, file), JSON.stringify(fileContent, null, 4))
    }

    async deploy(sites, featureName) {
        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteFolder = await this.folderManager.getSiteFolder('deploy', apiKey)
            const siteConfig = await this.#getSiteConfig(apiKey)
            await this.#executeOperationOnFeatures(featureName, siteFolder, { operation: 'deploy', args: [apiKey, siteConfig, siteDomain] })
        }
        return true
    }

    static isEqualCaseInsensitive(str1, str2) {
        return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0
    }

    async #executeOperationOnFeatures(featureName, directory, runnable) {
        for (const feature of this.#features) {
            if (featureName && !SiteFeature.isEqualCaseInsensitive(featureName, feature.constructor.name)) {
                continue
            }
            const workingDirectory = this.#calculateWorkingDirectory(directory, feature)
            if (fs.existsSync(workingDirectory)) {
                process.stdout.write(`- ${feature.getName()}: `)
                await feature[runnable.operation](...runnable.args) // the same as -> feature.init(apiKey, siteConfig, siteDomain)
                readline.clearLine(process.stdout, 0)
                readline.cursorTo(process.stdout, 0)
                console.log(`- ${feature.getName()}: \x1b[32m%s\x1b[0m`, `Done`)
            } else {
                console.log(`- ${feature.getName()}: %s`, `Skip`)
            }
        }
    }

    #calculateWorkingDirectory(directory, feature) {
        let workingDirectory = directory
        if (!workingDirectory.endsWith(FolderManager.SITES_DIRECTORY)) {
            workingDirectory = path.join(directory, feature.getName())
        }
        if (fs.existsSync(workingDirectory)) {
            return workingDirectory
        } else if (directory.startsWith(FolderManager.BUILD_DIRECTORY)) {
            const srcWorkingDirectory = workingDirectory.replace(FolderManager.BUILD_DIRECTORY, FolderManager.SRC_DIRECTORY)
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
        const paths = await this.getFiles(FolderManager.BUILD_DIRECTORY)
        const sites = new Set()
        for (const path of paths) {
            const baseIdx = path.indexOf(FolderManager.BUILD_DIRECTORY)
            let startIdx = path.indexOf(FolderManager.SITES_DIRECTORY)
            if (startIdx > -1) {
                startIdx += FolderManager.SITES_DIRECTORY.length
                const endIdx = path.indexOf('/', startIdx)
                if (endIdx > -1) {
                    sites.add(path.substring(baseIdx, endIdx))
                }
            }
        }
        return Array.from(sites)
    }
}
