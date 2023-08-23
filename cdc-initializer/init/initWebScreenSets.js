/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { getScreenSetsRequest } from '../services/gigya/gigya.helpers.js'

const initWebScreenSets = async ({
    gigya,
    apiKey,
    dataCenter,
    reset,
    srcDirectory,
    templateJavaScript,
    templateCssCustomCodeSeparatorStart,
    templateCssCustomCodeSeparatorEnd,
}) => {
    // Get screenSets
    const screenSetsRes = await getScreenSetsRequest(gigya, { apiKey, dataCenter, include: 'screenSetID,html,css,javascript,translations,metadata' })
    if (screenSetsRes.errorCode) {
        throw new Error(JSON.stringify(screenSetsRes))
    }
    if (!screenSetsRes.screenSets.length) {
        console.log(
            '\x1b[33m%s\x1b[0m',
            `There are no screenSets in this site. It this is a parent site, please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.`,
        )
        // throw new Error('There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.')
    }
    const { screenSets } = screenSetsRes

    // Check if webSdk directory already exists
    if (fs.existsSync(srcDirectory)) {
        if (!reset) {
            throw new Error(`The "${srcDirectory}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
        }

        // Remove existing src/webSdk directory if "reset" is enabled,
        fs.rmSync(srcDirectory, { recursive: true, force: true })
    }

    // Create directory
    fs.mkdirSync(srcDirectory, { recursive: true })

    screenSets.map((screenSet) => {
        // If JavaScript is empty, get default template
        if (!screenSet.javascript) {
            screenSet.javascript = fs.readFileSync(templateJavaScript, { encoding: 'utf8' })
        }

        // Wrap javascript in "module"
        screenSet.javascript = `export default ${screenSet.javascript}`
        screenSet.javascript = screenSet.javascript.substring(0, screenSet.javascript.lastIndexOf('}') + 1) + ';\n'

        // Clear HTML string syntax
        // screenSet.html = screenSet.html.replaceAll(`\\"`, '"')
        // screenSet.html = screenSet.html.replaceAll(`\\r\\n`, '\n')

        // Create screenSet directory
        fs.mkdirSync(path.join(srcDirectory, screenSet.screenSetID), { recursive: true })

        // Create files
        fs.writeFileSync(path.join(srcDirectory, screenSet.screenSetID, `${screenSet.screenSetID}.js`), screenSet.javascript)
        // fs.writeFileSync(path.join(srcDirectory,screenSet.screenSetID, `${screenSet.screenSetID}.html`), screenSet.html)
        // fs.writeFileSync(path.join(srcDirectory,screenSet.screenSetID, `${screenSet.screenSetID}.metadata.json`), JSON.stringify(screenSet.metadata, null, 4))
        // fs.writeFileSync(path.join(srcDirectory,screenSet.screenSetID, `${screenSet.screenSetID}.translations.json`), JSON.stringify(screenSet.translations, null, 4))

        // Split css Files
        const cssSplit = screenSet.css.split(templateCssCustomCodeSeparatorStart)
        const cssCustom = cssSplit.length < 2 ? '' : cssSplit[1].split(templateCssCustomCodeSeparatorEnd)[0].trim()
        const cssDefault = screenSet.css.replace(cssCustom, '').replace(templateCssCustomCodeSeparatorStart, '').replace(templateCssCustomCodeSeparatorEnd, '').trim()

        // Create css files
        fs.writeFileSync(path.join(srcDirectory, screenSet.screenSetID, `${screenSet.screenSetID}.default.css`), cssDefault)
        fs.writeFileSync(path.join(srcDirectory, screenSet.screenSetID, `${screenSet.screenSetID}.custom.css`), cssCustom)
    })
}

export { initWebScreenSets }
