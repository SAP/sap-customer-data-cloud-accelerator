/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from "fs";
import path from "path";
import readline from "readline";
import SiteConfigurator from "../sap-cdc-toolkit/configurator/siteConfigurator";
import {BUILD_DIRECTORY, FEATURE_NAME_LIST, SRC_DIRECTORY} from "../constants";
import Schema from "./schema";
import WebSdk from "./webSdk";
import Policies from "./policies";

export default class Feature {
    #credentials
    #features = []

    constructor(credentials) {
        this.#credentials = credentials
        this.#features.push(new Schema(credentials))
        this.#features.push(new WebSdk(credentials))
        this.#features.push(new Policies(credentials))
    }

    async init(sites, featureName, environment, reset) {
        try {
            const environmentInfo = environment ? ` (${environment})` : ''
            console.log(`Init start${environmentInfo}`)

            if (!sites) {
                let msg = "No source sites to use"
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
                await this.#initFeatures(apiKey, siteConfig, siteDomain, featureName, reset)
            }

            console.log("\n")
            this.#logResult(`Success`, environment)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            this.#logResult(`Fail`, environment)
        }
    }

    #logResult(result, environment) {
        const envMsg = environment ? ` (${environment})` : ''
        const msg = `Init result${envMsg}: \x1b[31m%s\x1b[0m\n`
        console.log(msg, result)
    }

    async #getSiteConfig(apiKey) {
        const siteConfigurator = new SiteConfigurator(this.#credentials.userKey, this.#credentials.secret)
        const siteConfig = await siteConfigurator.getSiteConfig(apiKey, 'us1')
        if (siteConfig.errorCode) {
            throw new Error(JSON.stringify(siteConfig))
        }
        return siteConfig
    }

    async #initFeatures(apiKey, siteConfig, siteDomain, featureName, reset) {
        for(const feature of this.#features) {
            if(featureName && !Feature.isEqualCaseInsensitive(featureName, feature.constructor.name)) {
                continue
            }
            if (fs.existsSync(SRC_DIRECTORY)) {
                process.stdout.write(`- ${feature.getName()}: `)
                await feature.init(apiKey, siteConfig, siteDomain, reset)
                process.stdout.clearLine()
                process.stdout.cursorTo(0)
                console.log(`- ${feature.getName()}: \x1b[32m%s\x1b[0m`, `Done`)
            } else {
                console.log(`- ${feature.getName()}: %s`, `Skip`)
            }
        }
    }

    async reset(sites, featureName, environment) {
        // Get confirmation from user to replace existing directories
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        return rl.question(`This will overwrite all files in your src/ directory, are you sure you want to continue? (Y/n)\n`, async (response) => {
            rl.close()
            if (response.toUpperCase() === 'Y') {
                await this.init(sites, featureName, environment, true)
            }
        })
    }

    async build() {
        try {
            console.log('\nBuild start')

            // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
            const sites = ['', ...fs.readdirSync(SRC_DIRECTORY).filter((DIR) => !FEATURE_NAME_LIST.includes(DIR) && fs.existsSync(`${SRC_DIRECTORY}${DIR}/`))]

            // Loop all site directories and run build fuction for each
            for (const siteDomain of sites) {
                if(!siteDomain) {
                    continue
                }
                console.log(`\n${path.join(SRC_DIRECTORY, siteDomain)}`)

                this.#buildFeatures(siteDomain)
            }

            console.log('\nBuild result: \x1b[32m%s\x1b[0m\n', `Success`)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            console.log('Build result: \x1b[31m%s\x1b[0m', `Fail\n`)
        }
    }

    #buildFeatures(siteDomain) {
        for(const feature of this.#features) {
            const workingDir = path.join(SRC_DIRECTORY, siteDomain, feature.getName())
            if (fs.existsSync(workingDir)) {
                process.stdout.write(`- ${feature.getName()}: `)
                feature.build(siteDomain)
                process.stdout.clearLine()
                process.stdout.cursorTo(0)
                console.log(`- ${feature.getName()}: \x1b[32m%s\x1b[0m`, `Done`)
            } else {
                console.log(`- ${feature.getName()}: %s`, `Skip`)
            }
        }
    }

    static createFolder(srcDirectory, reset) {
        if (fs.existsSync(srcDirectory)) {
            if (!reset) {
                throw new Error(`The "${srcDirectory}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
            }
            // Remove existing src/schema directory if "reset" is enabled,
            fs.rmSync(srcDirectory, { recursive: true, force: true })
        }
        fs.mkdirSync(srcDirectory, { recursive: true })
    }

    static copyFileFromSrcToBuild(siteDomain, file, feature) {
        const srcBasePath = path.join(SRC_DIRECTORY, siteDomain, feature.getName())
        let fileContent = JSON.parse(fs.readFileSync(path.join(srcBasePath, file), { encoding: 'utf8' }))
        const buildBasePath = path.join(BUILD_DIRECTORY, siteDomain, feature.getName())
        fs.writeFileSync(path.join(buildBasePath, file), JSON.stringify(fileContent, null, 4))
    }

    async deploy(sites, featureName, environment) {
        try {
            const environmentInfo = environment ? ` (${environment})` : ''
            console.log(`Deploy start${environmentInfo}`)

            if (!sites) {
                let msg = "No deploy sites to use"
                msg += environment ? ` for "${environment}" environment.` : '.'
                throw new Error(msg)
            }

            for (const { apiKey, siteDomain = '' } of sites) {
                // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
                const msg = siteDomain ? `\n${siteDomain} - ${apiKey}` : `\n${apiKey}`
                console.log(msg)

                const siteConfig = await this.#getSiteConfig(apiKey)
                await this.#deployFeatures(apiKey, siteConfig, siteDomain, featureName)
            }

            console.log(`\nDeploy result${environment ? ` (${environment})` : ''}: \x1b[32m%s\x1b[0m\n`, `Success`)
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
            console.log(`Deploy result${environment ? ` (${environment})` : ''}: \x1b[31m%s\x1b[0m\n`, `Fail`)
        }
    }

    async #deployFeatures(apiKey, siteConfig, siteDomain, featureName) {
        for(const feature of this.#features) {
            if(featureName && !Feature.isEqualCaseInsensitive(featureName, feature.constructor.name)) {
                continue
            }
            const workingDir = path.join(BUILD_DIRECTORY, siteDomain, feature.getName())
            if (fs.existsSync(workingDir)) {
                process.stdout.write(`- ${feature.getName()}: `)
                await feature.deploy(apiKey, siteConfig, siteDomain)
                process.stdout.clearLine()
                process.stdout.cursorTo(0)
                console.log(`- ${feature.getName()}: \x1b[32m%s\x1b[0m`, `Done`)
            } else {
                console.log(`- ${feature.getName()}: %s`, `Skip`)
            }
        }
    }

    static isEqualCaseInsensitive(str1, str2) {
        return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0;
    }
}
