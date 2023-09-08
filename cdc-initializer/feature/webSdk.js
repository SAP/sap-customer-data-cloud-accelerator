/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import ToolkitWebSdk from '../sap-cdc-toolkit/copyConfig/websdk/websdk'
import { BUILD_DIRECTORY, CDC_INITIALIZER_DIRECTORY, SRC_DIRECTORY } from '../constants.js'
import fs from 'fs'
import path from 'path'
import { cleanJavaScriptModuleBoilerplateWebSdk, replaceFilenamesWithFileContents } from '../utils/utils'
import Feature from './feature'

export default class WebSdk {
    static #TEMPLATE_WEB_SDK_FILE = path.join(CDC_INITIALIZER_DIRECTORY, `/templates/defaultWebSdk.js`)
    #credentials

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDomain) {
        let { globalConf: originalWebSdk } = siteConfig

        // If globalConf is empty, get default template
        if (!originalWebSdk) {
            originalWebSdk = fs.readFileSync(`${WebSdk.#TEMPLATE_WEB_SDK_FILE}`, { encoding: 'utf8' })
        }

        // Wrap javascript in "module"
        const webSdk = `export default ${originalWebSdk}`

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, this.getName())
        Feature.createFolder(srcDirectory)

        // Create new webSdk file
        const fileName = path.join(srcDirectory, `${this.getName()}.js`)
        fs.writeFileSync(fileName, webSdk)
    }

    reset(siteDomain) {
        Feature.deleteFolder(path.join(SRC_DIRECTORY, siteDomain, this.getName()))
    }

    build(siteDomain) {
        const buildBasePath = path.join(BUILD_DIRECTORY, siteDomain, this.getName())
        const buildFileName = path.join(buildBasePath, `${this.getName()}.js`)

        let webSdkContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        webSdkContent = cleanJavaScriptModuleBoilerplateWebSdk(webSdkContent)

        // Find filenames and replace them with the contents of the file
        let webSdkBundled = replaceFilenamesWithFileContents(webSdkContent, buildBasePath).trim()

        // Remove webSdk/ directory
        fs.rmSync(buildBasePath, { recursive: true, force: true })
        fs.mkdirSync(buildBasePath)
        // Write the result file
        fs.writeFileSync(path.join(BUILD_DIRECTORY, siteDomain, this.getName(), `${this.getName()}.js`), webSdkBundled)
    }

    async deploy(apiKey, siteConfig, siteDomain) {
        const buildBasePath = path.join(BUILD_DIRECTORY, siteDomain, this.getName())
        const buildFileName = path.join(buildBasePath, `${this.getName()}.js`)
        // Get bundled webSdk
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }

        // Update webSdk on gigya
        const toolkitWebSdk = new ToolkitWebSdk(this.#credentials, apiKey, siteConfig.dataCenter)
        siteConfig.globalConf = fileContent
        const response = await toolkitWebSdk.set(apiKey, siteConfig, siteConfig.dataCenter)
        if (response.errorCode) {
            throw new Error(JSON.stringify(response))
        }
    }
}
