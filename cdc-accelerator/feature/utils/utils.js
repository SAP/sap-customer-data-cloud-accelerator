/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

const clearDirectoryContents = (directory) => {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true })
    }
    fs.mkdirSync(directory, { recursive: true })
}

const cleanJavaScriptModuleBoilerplateImportInline = (value) => {
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
    value = prependStringToEachLine(value, '    ')

    // Make module executable by wrapping in self executing function
    value = value.replaceAll(`var _default = `, 'return ')
    value = value.trimEnd()

    // // Make module executable by wrapping in self executing function
    // value = value.replaceAll(`var _default = `, 'var _module_object = ')
    // value = value.trimEnd()
    // value = value + '\n    return _module_object;'

    // // Wrap value in try catch to catch errors [DOESN'T WORK IN HERE, ONLY WHEN RUNNING THE FUNCTION ON THE EVENT]
    // value = `try {\n${value}\n} catch (e) {\n    console.error(e);\n}`
    // value = prependStringToEachLine(value, '    ')

    // Wrap in self executing function
    value = `(function() {\n${value}\n})();`

    return value
}

const cleanJavaScriptModuleBoilerplateScreenSetEvents = (value) => {
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

const cleanJavaScriptModuleBoilerplateWebSdk = (value) => {
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

const processMainScriptInlineImports = (value) => {
    // Separate events and helper functions in different strings
    const helperFunctions = value.substring(0, value.indexOf('\n{\n'))
    let eventFunctions = value.substring(value.indexOf('\n{\n'))

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
            let currentEventName
            const helperFunctionsInEvents = eventFunctions.split('\n').reduce((acc, line) => {
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

            // Wrap imported function calls in try catch to catch errors
            eventFunctions = eventFunctions
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

            // Prepend helper functions to events where they are used
            eventFunctions = eventFunctions
                .split('\n')
                .map((line) => {
                    // If line is an event function and is has any helper functions to be prepended, prepend them
                    if (helperFunctionsInEvents.find((entry) => line.includes(`    ${entry.eventName}: function(`))) {
                        // Add tabulation spaces based on current line
                        let tabulationSpaces = ' '.repeat(line.length - line.trimStart().length + 4)
                        const tabulatedHelperFunction = prependStringToEachLine(helperFunction, tabulationSpaces)
                        line = line + '\n' + tabulatedHelperFunction
                    }
                    return line
                })
                .join('\n')
        })

        // Replace with the injected helper functions in the events
        value = eventFunctions
    }

    return value.trim()
}

const bundleInlineImportScripts = (value, directory) => {
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
            fileContent = bundleInlineImportScripts(fileContent, path.dirname(filePath))

            // Remove module boilerplate
            fileContent = cleanJavaScriptModuleBoilerplateImportInline(fileContent)

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

const replaceFilenamesWithFileContents = (value, directory) => {
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
            fileContent = cleanJavaScriptModuleBoilerplateWebSdk(fileContent)

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

const prependStringToEachLine = (value, valueToPrepend, skipLines = 0) =>
    value
        .split('\n')
        .map((line, index) => (index >= skipLines ? `${valueToPrepend}${line}` : line))
        .join('\n')

const readJsonFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    return JSON.parse(fileContent)
}

export {
    clearDirectoryContents,
    cleanJavaScriptModuleBoilerplateWebSdk,
    cleanJavaScriptModuleBoilerplateScreenSetEvents,
    cleanJavaScriptModuleBoilerplateImportInline,
    prependStringToEachLine,
    replaceFilenamesWithFileContents,
    bundleInlineImportScripts,
    processMainScriptInlineImports,
    readJsonFile,
}
