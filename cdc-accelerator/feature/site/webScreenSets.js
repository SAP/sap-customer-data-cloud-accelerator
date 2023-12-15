/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitScreenSet from '../../sap-cdc-toolkit/copyConfig/screenset/screenset.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from '../siteFeature.js'
import { BUILD_DIRECTORY, CDC_ACCELERATOR_DIRECTORY, SRC_DIRECTORY } from '../../core/constants.js'

export default class WebScreenSets extends SiteFeature {
    static TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE = path.join(CDC_ACCELERATOR_DIRECTORY, 'templates', 'defaultScreenSetJavaScript.js')
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
        javascript = this.#bundleInlineImportScripts(javascript, buildScreenSetPath)

        // Remove screen-set events file boilerplate
        javascript = this.#cleanJavaScriptModuleBoilerplateScreenSetEvents(javascript)

        // Bundle inline imported scripts to the start of the events where they were used
        javascript = this.#processMainScriptInlineImports(javascript)

        // Replace JavaScript file
        fs.writeFileSync(jsFilename, javascript)

        // Remove all build files that are not the main JavaScript file (tests, imported files)
        fs.readdirSync(buildScreenSetPath).forEach((screenSetFilename) => {
            if (screenSetFilename !== `${screenSetID}.js`) {
                fs.rmSync(path.join(buildScreenSetPath, screenSetFilename), { recursive: true, force: true })
            }
        })
    }

    #bundleInlineImportScripts(value, directory) {
        let importedVariables = []
        let lines = value.split('\n')
        lines = lines.map((line) => {
            if (!line.includes('require(')) {
                return line
            }

            const variableInitialization = line.substring(0, line.indexOf(' = '))
            const variableName = variableInitialization.substring(variableInitialization.lastIndexOf(' ') + 1)
            importedVariables.push(variableName)

            let filename = line.substring(line.indexOf("require('") + "require('".length)
            filename = filename.substring(0, filename.indexOf("')"))

            // Add .js to filename if it does not have it
            if (filename.slice(-3) !== '.js') {
                filename = filename + '.js'
            }

            const filePath = path.join(directory, filename)

            try {
                // Read file
                let fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

                // Recursively replace filenames with file contents for subsequent files
                fileContent = this.#bundleInlineImportScripts(fileContent, path.dirname(filePath))

                // Remove module boilerplate
                fileContent = this.#cleanJavaScriptModuleBoilerplateImportInline(fileContent)

                // Replace import with file content (Remove opening and closing of "_interopRequireDefault(")
                line = `${variableInitialization} = ${fileContent}`
            } catch (err) {
                console.error('Not found.', err)
                return
            }
            return line
        })

        value = lines.join('\n')

        // Cleanup ['default'] in event calling
        // NOTE: For now, do NOT support destructuring on imports, example: import { filterBlocklist } from './preference-center-ProfileUpdate.utils.js'
        if (importedVariables.length) {
            importedVariables.forEach((variableName) => {
                value = value.replaceAll(`${variableName}['default']`, variableName)
            })
        }

        return value
    }

    #cleanJavaScriptModuleBoilerplateImportInline(value) {
        // Remove _interopRequireDefault function
        value = value
            .replaceAll(
                `function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}`,
                '',
            )
            .trim()

        // Clean start of the module
        if (value.indexOf(`exports['default'] = void 0;\n`) !== -1) {
            value = value.substring(value.indexOf(`exports['default'] = void 0;\n`) + `exports['default'] = void 0;\n`.length)
        }

        // Clean end of the module
        if (value.indexOf(`exports['default'] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports['default'] = _default`))
        }
        if (value.indexOf(`exports["default"] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports["default"] = _default`))
        }

        // Add tabulation spaces based on current line
        value = this.#prependStringToEachLine(value, '    ')

        // Make module executable by wrapping in self executing function
        value = value.replaceAll(`(exports['default'] = `, '(')
        value = value.replaceAll(`var _default = `, 'return ')
        value = value.trimEnd()

        // Wrap in self executing function
        value = `(function() {\n${value}\n})();`

        return value
    }

    #cleanJavaScriptModuleBoilerplateScreenSetEvents(value) {
        // Remove _interopRequireDefault function
        value = value
            .replaceAll(
                `function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}`,
                '',
            )
            .trim()

        // Clean start of the module
        if (value.indexOf(`exports['default'] = void 0;\n`) !== -1) {
            value = value.substring(value.indexOf(`exports['default'] = void 0;\n`) + `exports['default'] = void 0;\n`.length)
        }

        // Clean end of the module
        if (value.indexOf(`exports['default'] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports['default'] = _default`))
        }
        if (value.indexOf(`exports["default"] = _default`) !== -1) {
            value = value.substring(0, value.indexOf(`exports["default"] = _default`))
        }

        // To make the module returnable, clean the object variable declaration and ; on the end of the object

        if (value.indexOf("var _default = (exports['default'] = {") !== -1) {
            value = value.replace("var _default = (exports['default'] = {", '({')
        }
        if (value.indexOf('var _default = {') !== -1) {
            value = value.replace('var _default = {', '{')
        }
        value = value.trimEnd()
        if (value.slice(-1) === ';') {
            value = value.substring(0, value.length - 1)
        }

        // Change CDC event functions
        value = value.replaceAll('function onError', 'function')
        value = value.replaceAll('function onBeforeValidation', 'function')
        value = value.replaceAll('function onBeforeSubmit', 'function')
        value = value.replaceAll('function onSubmit', 'function')
        value = value.replaceAll('function onAfterSubmit', 'function')
        value = value.replaceAll('function onBeforeScreenLoad', 'function')
        value = value.replaceAll('function onAfterScreenLoad', 'function')
        value = value.replaceAll('function onFieldChanged', 'function')
        value = value.replaceAll('function onHide', 'function')

        return value
    }

    #processMainScriptInlineImports(value){
        let { helperFunctions, eventFunctions } = this.#getHelperAndEventFunctions(value)

        // Inject helper functions into each event
        if (helperFunctions.trim().length > 5) {
            // Get each function in helperFunctions into a string array
            let helperFunctionsArray = helperFunctions.split('\nvar _')

            // Add "var _" back to each function because it was removed on "split"
            helperFunctionsArray = helperFunctionsArray.map((helperFunction) => (helperFunction.substring(0, 'var _'.length) !== 'var _' ? 'var _' + helperFunction : helperFunction))

            // Trim functions
            helperFunctionsArray = helperFunctionsArray.map((helperFunction) => helperFunction.trim())

            // Loop each functions and prepend it to each event where it's used
            helperFunctionsArray.forEach((helperFunction) => {
                // Get the name of the helper function
                const helperFunctionName = helperFunction.substring('var '.length, helperFunction.indexOf(' = (function'))

                // Get the events where the helper function is used
                const helperFunctionsInEvents = this.#getHelperFunctionsInEvents(eventFunctions, helperFunctionName)

                // Wrap imported function calls in try catch to catch errors
                eventFunctions = this.#wrapFunctions(eventFunctions, helperFunctionName)

                // Prepend helper functions to events where they are used
                eventFunctions = this.#prependFunctionsToEvents(eventFunctions, helperFunctionsInEvents, helperFunction)
            })

            // Replace with the injected helper functions in the events
            value = eventFunctions
        }

        return value.trim()
    }

    #getHelperAndEventFunctions(value) {
        let eventAndHelperFunctionsSeparator = '\n({\n'
        // Separate events and helper functions in different strings
        let idx = value.indexOf(eventAndHelperFunctionsSeparator)
        if (idx !== -1) {
            const helperFunctions = value.substring(0, idx)
            let eventFunctions = value.substring(idx)
            return { helperFunctions, eventFunctions }
        }
        eventAndHelperFunctionsSeparator = '\n{\n'
        // Separate events and helper functions in different strings
        idx = value.indexOf(eventAndHelperFunctionsSeparator)
        const helperFunctions = value.substring(0, idx)
        let eventFunctions = value.substring(idx)
        return { helperFunctions, eventFunctions }
    }

    #getHelperFunctionsInEvents(eventFunctions, helperFunctionName) {
        let currentEventName
        return eventFunctions.split('\n').reduce((acc, line) => {
            // If line is an event function, get event name
            if (line.substring(0, 6) === '    on') {
                currentEventName = line.substring(line.indexOf('on'), line.indexOf(': function'))
            }
            // If line does not include helper function, return false
            if (!line.includes(`${helperFunctionName}.`) && !line.includes(`${helperFunctionName}[`) && !line.includes(`${helperFunctionName}(`)) {
                return acc
            }
            if (acc.find((entry) => entry.eventName === currentEventName && entry.helperFunctionName === helperFunctionName)) {
                return acc
            }
            acc.push({ eventName: currentEventName, helperFunctionName })
            return acc
        }, [])
    }

    #wrapFunctions(eventFunctions, helperFunctionName) {
        return eventFunctions
            .split('\n')
            .map((line) => {
                // If line does not include helper function, return false
                if (!line.includes(`${helperFunctionName}.`) && !line.includes(`${helperFunctionName}[`) && !line.includes(`${helperFunctionName}(`)) {
                    return line
                }

                let tabulationSpaces = ' '.repeat(line.length - line.trimStart().length)
                line = `${tabulationSpaces}try {\n    ${line}\n${tabulationSpaces}} catch (e) {\n${tabulationSpaces}    console.error(e);\n${tabulationSpaces}}`

                return line
            })
            .join('\n')
    }

    #prependFunctionsToEvents(eventFunctions, helperFunctionsInEvents, helperFunction) {
        return eventFunctions
            .split('\n')
            .map((line) => {
                // If line is an event function and is has any helper functions to be prepended, prepend them
                if (helperFunctionsInEvents.find((entry) => line.includes(`    ${entry.eventName}: function(`))) {
                    // Add tabulation spaces based on current line
                    let tabulationSpaces = ' '.repeat(line.length - line.trimStart().length + 4)
                    const tabulatedHelperFunction = this.#prependStringToEachLine(helperFunction, tabulationSpaces)
                    line = line + '\n' + tabulatedHelperFunction
                }
                return line
            })
            .join('\n')
    }

    #prependStringToEachLine(value, valueToPrepend, skipLines = 0) {
        value
            .split('\n')
            .map((line, index) => (index >= skipLines ? `${valueToPrepend}${line}` : line))
            .join('\n')
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
