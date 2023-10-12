/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitScreenSet from '../sap-cdc-toolkit/copyConfig/screenset/screenset.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from './siteFeature.js'
import { BUILD_DIRECTORY, CDC_ACCELERATOR_DIRECTORY, SRC_DIRECTORY } from './constants.js'
import { bundleInlineImportScripts, cleanJavaScriptModuleBoilerplateScreenSetEvents, processMainScriptInlineImports } from '../utils/utils.js'

export default class WebScreenSets extends SiteFeature {
    static TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE = path.join(CDC_ACCELERATOR_DIRECTORY, `/templates/defaultScreenSetJavaScript.js`)
    static TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START = `/* || CUSTOM CODE START */`
    static TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END = `/* || CUSTOM CODE END */`

    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        const screenSetResponse = await this.#getScreenSets(apiKey, siteConfig.dataCenter)
        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        this.#initFiles(featureDirectory, screenSetResponse.screenSets)
    }

    async #getScreenSets(apiKey, dataCenter) {
        const toolkitScreenSet = new ToolkitScreenSet(this.credentials, apiKey, dataCenter)
        const screenSetResponse = await toolkitScreenSet.get()
        if (screenSetResponse.errorCode) {
            throw new Error(JSON.stringify(screenSetResponse))
        }
        if (!screenSetResponse.screenSets.length) {
            throw new Error(
                'There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.',
            )
        }
        return screenSetResponse
    }

    #initFiles(featureDirectory, screenSets) {
        screenSets.map((screenSet) => {
            // Create screenSet directory
            const webScreenSetDirectory = path.join(featureDirectory, screenSet.screenSetID)
            this.createDirectoryIfNotExists(webScreenSetDirectory)

            this.#initJavascriptFiles(webScreenSetDirectory, screenSet.screenSetID, screenSet.javascript)
            this.#initHtmlFiles(webScreenSetDirectory, screenSet.screenSetID, screenSet)
            this.#initCssFiles(webScreenSetDirectory, screenSet.screenSetID, screenSet.css)
        })
    }

    #initJavascriptFiles(webScreenSetDirectory, screenSetID, javascript) {
        // If JavaScript is empty, get default template
        if (!javascript || javascript.length === 0) {
            javascript = fs.readFileSync(WebScreenSets.TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE, { encoding: 'utf8' })
        }

        // Wrap javascript in "module"
        javascript = `export default ${javascript}`
        javascript = javascript.substring(0, javascript.lastIndexOf('}') + 1) + ';\n'

        // Create files
        fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.js`), javascript)
    }

    #initHtmlFiles(webScreenSetDirectory, screenSetID, screenSet) {
        // Clear HTML string syntax
        // screenSet.html = screenSet.html.replaceAll(`\\"`, '"')
        // screenSet.html = screenSet.html.replaceAll(`\\r\\n`, '\n')

        // Create files
        // fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.html`), screenSet.html)
        // fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.metadata.json`), JSON.stringify(screenSet.metadata, null, 4))
        // fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.translations.json`), JSON.stringify(screenSet.translations, null, 4))
        return
    }

    #initCssFiles(webScreenSetDirectory, screenSetID, css) {
        // Split css Files
        const cssSplit = css.split(WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START)
        const cssCustom = cssSplit.length < 2 ? '' : cssSplit[1].split(WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END)[0].trim()
        const cssDefault = css
            .replace(cssCustom, '')
            .replace(WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START, '')
            .replace(WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END, '')
            .trim()

        // Create css files
        fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.default.css`), cssDefault)
        fs.writeFileSync(path.join(webScreenSetDirectory, `${screenSetID}.custom.css`), cssCustom)
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {
        const buildFeaturePath = path.join(sitePath, this.getName())
        //this.clearDirectoryContents(buildFeaturePath)

        fs.readdirSync(buildFeaturePath).forEach((screenSetID) => {
            // Ignore non-directories
            const buildScreenSetPath = path.join(buildFeaturePath, screenSetID)
            if (fs.lstatSync(buildScreenSetPath).isDirectory()) {
                this.buildScreenSet(buildScreenSetPath, screenSetID)
            }
        })
    }

    buildScreenSet(buildScreenSetPath, screenSetID) {
        fs.readdirSync(buildScreenSetPath).forEach((screenSetFilename) => {
            // Ignore javascript files that are not the main one
            if (screenSetFilename === `${screenSetID}.js`) {
                this.#buildJavascriptFiles(buildScreenSetPath, screenSetID, screenSetFilename)
                //this.#buildHtmlFiles(buildScreenSetPath, screenSetID)
                this.#buildCssFiles(buildScreenSetPath, screenSetID)
            }
        })
    }

    #buildJavascriptFiles(buildScreenSetPath, screenSetID, screenSetFilename) {
        // Get JavaScript file from build/
        const jsFilename = path.join(buildScreenSetPath, screenSetFilename)
        let javascript = fs.readFileSync(jsFilename, { encoding: 'utf8' })

        // Bundle all imports in one file
        javascript = bundleInlineImportScripts(javascript, buildScreenSetPath)

        // Remove screen-set events file boilerplate
        javascript = cleanJavaScriptModuleBoilerplateScreenSetEvents(javascript)

        // Bundle inline imported scripts to the start of the events where they were used
        javascript = processMainScriptInlineImports(javascript)

        // Replace JavaScript file
        fs.writeFileSync(jsFilename, javascript)

        // Remove all build files that are not the main JavaScript file (tests, imported files)
        fs.readdirSync(buildScreenSetPath).forEach((screenSetFilename) => {
            if (screenSetFilename !== `${screenSetID}.js`) {
                fs.rmSync(path.join(buildScreenSetPath, screenSetFilename), { recursive: true, force: true })
            }
        })
    }

    #buildHtmlFiles(buildScreenSetPath, screenSetID) {
        // Get html files from src/ because they are not compiled by babel
        // const htmlBuildFilename = path.join(buildScreenSetPath, `${screenSetID}.html`)
        // const htmlSrcFilename = path.join(buildScreenSetPath.replace(BUILD_DIRECTORY, SRC_DIRECTORY), `${screenSetID}.html`)
        // const html = !fs.existsSync(htmlSrcFilename) ? '' : fs.readFileSync(htmlSrcFilename, { encoding: 'utf8' })
        // if (html) {
        //     fs.writeFileSync(htmlBuildFilename, html)
        // }
    }

    #buildCssFiles(buildScreenSetPath, screenSetID) {
        const srcScreenSetPath = buildScreenSetPath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        // Get css files from src/ because they are not compiled by babel
        const cssDefaultSrcFilename = path.join(srcScreenSetPath, `${screenSetID}.default.css`)
        const cssDefault = !fs.existsSync(cssDefaultSrcFilename) ? '' : fs.readFileSync(cssDefaultSrcFilename, { encoding: 'utf8' })

        const cssCustomSrcFilename = path.join(srcScreenSetPath, `${screenSetID}.custom.css`)
        const cssCustom = !fs.existsSync(cssCustomSrcFilename) ? '' : fs.readFileSync(cssCustomSrcFilename, { encoding: 'utf8' })

        // Merge css files in build/
        const cssFilename = path.join(buildScreenSetPath, `${screenSetID}.css`)
        const css = !cssCustom
            ? cssDefault
            : `${cssDefault}\n\n${WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START}\n\n${cssCustom}\n\n${WebScreenSets.TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END}\n`
        if (css) {
            fs.writeFileSync(cssFilename, css)
        }
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const dataCenter = siteConfig.dataCenter
        const screenSetResponse = await this.#getScreenSets(apiKey, dataCenter)
        const { screenSets: originalScreenSets } = screenSetResponse
        const featureDirectory = path.join(siteDirectory, this.getName())

        return Promise.all(
            fs.readdirSync(featureDirectory).map(async (screenSetID) => {
                // Get compiled files
                let data = { screenSetID: screenSetID }
                const file = path.join(featureDirectory, screenSetID, screenSetID)
                data.javascript = this.#buildPayload(`${file}.js`)
                data.css = this.#buildPayload(`${file}.css`)

                const originalScreenSet = originalScreenSets.find((screenSet) => screenSet.screenSetID === screenSetID)
                // Check if it's a valid screen-set directory
                if (!originalScreenSet) {
                    //console.log(`The directory "${screenSetID}/" was ignored because it does not exists on the site`)
                    return true
                }

                // because html is required, get it using request
                if (!originalScreenSet.html) {
                    throw new Error(`Original ScreenSet ${screenSetID} do not contains html on site ${apiKey}: ${JSON.stringify(originalScreenSet)}`)
                }
                data.html = originalScreenSet.html
                return this.deployUsingToolkit(apiKey, dataCenter, data)
            }),
        )
    }

    #buildPayload(file) {
        const content = !fs.existsSync(file) ? '' : fs.readFileSync(file, { encoding: 'utf8' })
        return content ? content : undefined
    }

    async deployUsingToolkit(apiKey, dataCenter, payload) {
        const toolkitScreenSet = new ToolkitScreenSet(this.credentials, apiKey, dataCenter)
        return toolkitScreenSet.set(apiKey, dataCenter, payload)
    }
}
