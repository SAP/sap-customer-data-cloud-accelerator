/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import SiteConfigurator from '../sap-cdc-toolkit/configurator/siteConfigurator'
import { BUILD_DIRECTORY, FEATURE_NAME_LIST, SRC_DIRECTORY } from '../constants'
import Schema from './schema'
import WebSdk from './webSdk'
import Policies from './policies'

export default class Feature {
    #credentials
    #features = []

    constructor(credentials) {
        this.#credentials = credentials
        this.#features.push(new Schema(credentials))
        this.#features.push(new WebSdk(credentials))
        this.#features.push(new Policies(credentials))
    }

    getFeatures() {
        return this.#features
    }

    async execute(phase, sites, featureName, environment) {
        try {
            switch (phase) {
                case 'init':
                    await this.init(sites, featureName, environment)
                    break
                case 'reset':
                    const resetConfirmed = await this.reset(sites, featureName)
                    if (resetConfirmed) {
                        await this.init(sites, featureName, environment)
                    }
                    break
                case 'build':
                    await this.build()
                    break
                case 'deploy':
                    await this.deploy(sites, featureName, environment)
                    break
                default:
                    console.log(`Unknown phase ${phase}`)
            }
            return true
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            this.#logFailResult(phase, environment)
            return false
        }
    }

    async init(sites, featureName, environment) {
        const environmentInfo = environment ? ` (${environment})` : ''
        console.log(`Init start${environmentInfo}`)

        if (!sites || !sites.length) {
            let msg = 'No source sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        // Create src/ directory if it doesn't exist
        if (!fs.existsSync(SRC_DIRECTORY)) {
            fs.mkdirSync(SRC_DIRECTORY)
        }

        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteConfig = await this.#getSiteConfig(apiKey)
            await this.#executeOperationOnFeatures(featureName, SRC_DIRECTORY, { operation: 'init', args: [apiKey, siteConfig, siteDomain] })
        }

        console.log('\n')
        this.#logSuccessResult('Init', environment)
        return true
    }

    #logResult(operation, result, color, environment) {
        const envMsg = environment ? ` (${environment})` : ''
        const msg = `${operation} result${envMsg}: \x1b[${color}m%s\x1b[0m\n`
        console.log(msg, result)
    }

    #logSuccessResult(operation, environment) {
        this.#logResult(operation, 'Success', '32', environment)
    }

    #logFailResult(operation, environment) {
        this.#logResult(operation, 'Fail', '31', environment)
    }

    async #getSiteConfig(apiKey) {
        const siteConfigurator = new SiteConfigurator(this.#credentials.userKey, this.#credentials.secret)
        const siteConfig = await siteConfigurator.getSiteConfig(apiKey, 'us1')
        if (siteConfig.errorCode) {
            throw new Error(JSON.stringify(siteConfig))
        }
        return siteConfig
    }

    resetConfirmation = () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        return new Promise((resolve, reject) => {
            rl.question(`This will overwrite all files in your src/ directory, are you sure you want to continue? (Y/n)\n`, async (response) => {
                rl.close()
                resolve(response.toUpperCase() === 'Y' ? true : false)
            })
        })
    }

    async #doReset(sites, featureName) {
        for (const { apiKey, siteDomain = '' } of sites) {
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)
            await this.#executeOperationOnFeatures(featureName, SRC_DIRECTORY, { operation: 'reset', args: [siteDomain] })
        }
        console.log('\n')
        this.#logSuccessResult('Reset')
        return true
    }

    async reset(sites, featureName) {
        console.log('\nReset start')
        // Get confirmation from user to replace existing directories
        let confirmation = await this.resetConfirmation()
        if (confirmation) {
            confirmation = await this.#doReset(sites, featureName)
        }
        return confirmation
    }

    async build() {
        console.log('\nBuild start')

        // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
        const sites = ['', ...fs.readdirSync(SRC_DIRECTORY).filter((DIR) => !FEATURE_NAME_LIST.includes(DIR) && fs.existsSync(`${SRC_DIRECTORY}${DIR}/`))]

        // Loop all site directories and run build function for each
        for (const siteDomain of sites) {
            if (!siteDomain) {
                continue
            }
            console.log(`\n${path.join(SRC_DIRECTORY, siteDomain)}`)
            await this.#executeOperationOnFeatures(undefined, path.join(SRC_DIRECTORY, siteDomain), { operation: 'build', args: [siteDomain] })
        }

        console.log('\n')
        this.#logSuccessResult('Build')
        return true
    }

    static deleteFolder(folder) {
        if (fs.existsSync(folder)) {
            fs.rmSync(folder, { recursive: true, force: true })
        }
    }

    static createFolder(folder) {
        if (fs.existsSync(folder)) {
            throw new Error(`The "${folder}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
        }
        fs.mkdirSync(folder, { recursive: true })
    }

    static copyFileFromSrcToBuild(siteDomain, file, feature) {
        const srcBasePath = path.join(SRC_DIRECTORY, siteDomain, feature.getName())
        const fileContent = JSON.parse(fs.readFileSync(path.join(srcBasePath, file), { encoding: 'utf8' }))
        const buildBasePath = path.join(BUILD_DIRECTORY, siteDomain, feature.getName())
        fs.writeFileSync(path.join(buildBasePath, file), JSON.stringify(fileContent, null, 4))
    }

    async deploy(sites, featureName, environment) {
        const environmentInfo = environment ? ` (${environment})` : ''
        console.log(`\nDeploy start${environmentInfo}`)

        if (!sites) {
            let msg = 'No deploy sites to use'
            msg += environment ? ` for "${environment}" environment.` : '.'
            throw new Error(msg)
        }

        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
            console.log(msg)

            const siteConfig = await this.#getSiteConfig(apiKey)
            await this.#executeOperationOnFeatures(featureName, path.join(BUILD_DIRECTORY, siteDomain), { operation: 'deploy', args: [apiKey, siteConfig, siteDomain] })
        }

        console.log('\n')
        this.#logSuccessResult('Deploy', environment)
        return true
    }

    static isEqualCaseInsensitive(str1, str2) {
        return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0
    }

    async #executeOperationOnFeatures(featureName, folder, runnable) {
        for (const feature of this.#features) {
            let workingFolder = folder
            if (featureName && !Feature.isEqualCaseInsensitive(featureName, feature.constructor.name)) {
                continue
            }
            if (!workingFolder.endsWith(SRC_DIRECTORY)) {
                workingFolder = path.join(folder, feature.getName())
            }
            if (fs.existsSync(workingFolder)) {
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
}
