import {BUILD_DIRECTORY, CDC_INITIALIZER_DIRECTORY, SRC_DIRECTORY} from '../constants.js'
import fs from 'fs'
import path from 'path'
import {cleanJavaScriptModuleBoilerplateWebSdk, replaceFilenamesWithFileContents} from "../utils/utils";
import Feature from "./feature";

class WebSdk {
    static #TEMPLATE_WEB_SDK_FILE = path.join(CDC_INITIALIZER_DIRECTORY, `/templates/defaultWebSdk.js`)
    #credentials

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return 'webSdk'
    }

    async init(apiKey, siteConfig, siteDomain, reset) {
        let { globalConf: originalWebSdk } = siteConfig

        // If globalConf is empty, get default template
        if (!originalWebSdk) {
            originalWebSdk = fs.readFileSync(`${WebSdk.#TEMPLATE_WEB_SDK_FILE}`, { encoding: 'utf8' })
        }

        // Wrap javascript in "module"
        const webSdk = `export default ${originalWebSdk}`

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, this.getName())
        Feature.createFolder(srcDirectory, reset)

        // Create new webSdk file
        const fileName = path.join(srcDirectory, `${this.getName()}.js`)
        fs.writeFileSync(fileName, webSdk)
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
}

export default WebSdk
