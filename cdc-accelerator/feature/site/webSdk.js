/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitWebSdk from '../../sap-cdc-toolkit/copyConfig/websdk/websdk.js'
import { CDC_ACCELERATOR_DIRECTORY } from '../../core/constants.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from '../siteFeature.js'

export default class WebSdk extends SiteFeature {
    static #TEMPLATE_WEB_SDK_FILE = path.join(CDC_ACCELERATOR_DIRECTORY, 'templates', 'defaultWebSdk.js')

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
        webSdkContent = this.#cleanJavaScriptModuleBoilerplateWebSdk(webSdkContent)

        // Find filenames and replace them with the contents of the file
        let webSdkBundled = this.#replaceFilenamesWithFileContents(webSdkContent, buildFeaturePath).trim()

        // Remove webSdk/ directory
        fs.rmSync(buildFeaturePath, { recursive: true, force: true })
        fs.mkdirSync(buildFeaturePath)
        // Write the result file
        fs.writeFileSync(buildFileName, webSdkBundled)
    }

    #cleanJavaScriptModuleBoilerplateWebSdk(value) {
        value = value.trim()

        value = value.substring(value.indexOf('var _default = {') + 'var _default = {'.length - 1)

        if (value.indexOf(`exports['default'] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports['default'] = _default`))
        }
        if (value.indexOf(`exports["default"] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports["default"] = _default`))
        }

        value = value.trim()

        if (value.slice(-1) === ';') {
            value = value.substring(0, value.length - 1)
        }

        return value
    }

    #replaceFilenamesWithFileContents(value, directory) {
        let lines = value.split('\n')
        lines = lines.map((line) => {
            if (!line.includes(".js'")) {
                return line
            }
            // Skip if line is it's commented
            if (line.trimStart().indexOf('//') === 0) {
                return line
            }

            // Get filename from line
            let filename = line.substring(0, line.indexOf(".js'") + 3)
            filename = filename.substring(filename.lastIndexOf("'") + 1)

            // Add .js to filename if it does not have it
            if (filename.slice(-3) !== '.js') {
                filename = filename + '.js'
            }

            try {
                // Read file
                let fileContent = fs.readFileSync(path.join(directory, filename), { encoding: 'utf8' })
                fileContent = this.#cleanJavaScriptModuleBoilerplateWebSdk(fileContent)

                // Recursively replace filenames with file contents for subsequent files
                const fileDirectory = path.join(directory, path.dirname(filename))
                fileContent = replaceFilenamesWithFileContents(fileContent, fileDirectory)

                // Add tabulation spaces based on current line
                let tabulationSpaces = ' '.repeat(line.length - line.trimStart().length)
                fileContent = prependStringToEachLine(fileContent, tabulationSpaces, 1)

                // Replace filename with file content
                line = line.replace(`'${filename}'`, fileContent)
            } catch (err) {
                console.log('Not found.', err)
                return
            }
            return line
        })

        value = lines.join('\n')

        return value
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.getName())
        const buildFileName = path.join(buildFeatureDirectory, `${this.getName()}.js`)
        // Get bundled webSdk
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }

        const response = await this.deployUsingToolkit(apiKey, siteConfig, fileContent)
        // Update webSdk on gigya
        if (response.errorCode) {
            throw new Error(JSON.stringify(response))
        }
    }
    async deployUsingToolkit(apiKey, siteConfig, fileContent) {
        const toolkitWebSdk = new ToolkitWebSdk(this.credentials, apiKey, siteConfig.dataCenter)
        siteConfig.globalConf = fileContent
        return await toolkitWebSdk.set(apiKey, siteConfig, siteConfig.dataCenter)
    }
}
