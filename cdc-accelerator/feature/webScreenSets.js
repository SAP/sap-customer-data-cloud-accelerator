/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitScreenSet from '../sap-cdc-toolkit/copyConfig/screenset/screenset.js'
import ToolkitScreenSetOptions from '../sap-cdc-toolkit/copyConfig/screenset/screensetOptions.js'
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
        const toolkitScreenSet = new ToolkitScreenSet(this.credentials, apiKey, siteConfig.dataCenter)
        const screenSetResponse = await toolkitScreenSet.get()
        if (screenSetResponse.errorCode) {
            throw new Error(JSON.stringify(screenSetResponse))
        }
        if (!screenSetResponse.screenSets.length) {
            // console.log(
            //     '\x1b[33m%s\x1b[0m',
            //     `There are no screenSets in this site. It this is a parent site, please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.`,
            // )
            throw new Error(
                'There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.',
            )
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        this.#initFiles(featureDirectory, screenSetResponse.screenSets)
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

    async deploy(apiKey, siteConfig, siteDirectory) {}
}
