/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import ToolkitWebSdk from '../sap-cdc-toolkit/copyConfig/websdk/websdk.js'
import { CDC_INITIALIZER_DIRECTORY } from '../constants.js'
import fs from 'fs'
import path from 'path'
import { cleanJavaScriptModuleBoilerplateWebSdk, replaceFilenamesWithFileContents } from '../utils/utils.js'
import SiteFeature from './siteFeature.js'

export default class WebSdk extends SiteFeature {
    static #TEMPLATE_WEB_SDK_FILE = path.join(CDC_INITIALIZER_DIRECTORY, `/templates/defaultWebSdk.js`)

    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        let { globalConf: originalWebSdk } = siteConfig

        // If globalConf is empty, get default template
        if (!originalWebSdk) {
            originalWebSdk = fs.readFileSync(`${WebSdk.#TEMPLATE_WEB_SDK_FILE}`, { encoding: 'utf8' })
        }

        // Wrap javascript in "module"
        const webSdk = `export default ${originalWebSdk}`

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        // Create new webSdk file
        const fileName = path.join(featureDirectory, `${this.getName()}.js`)
        fs.writeFileSync(fileName, webSdk)
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {
        const buildFeaturePath = path.join(sitePath, this.getName())
        const buildFileName = path.join(buildFeaturePath, `${this.getName()}.js`)

        let webSdkContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        webSdkContent = cleanJavaScriptModuleBoilerplateWebSdk(webSdkContent)

        // Find filenames and replace them with the contents of the file
        let webSdkBundled = replaceFilenamesWithFileContents(webSdkContent, buildFeaturePath).trim()

        // Remove webSdk/ directory
        fs.rmSync(buildFeaturePath, { recursive: true, force: true })
        fs.mkdirSync(buildFeaturePath)
        // Write the result file
        fs.writeFileSync(buildFileName, webSdkBundled)
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.getName())
        const buildFileName = path.join(buildFeatureDirectory, `${this.getName()}.js`)
        // Get bundled webSdk
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }

        // Update webSdk on gigya
        const toolkitWebSdk = new ToolkitWebSdk(this.credentials, apiKey, siteConfig.dataCenter)
        siteConfig.globalConf = fileContent
        const response = await toolkitWebSdk.set(apiKey, siteConfig, siteConfig.dataCenter)
        if (response.errorCode) {
            throw new Error(JSON.stringify(response))
        }
    }
}
