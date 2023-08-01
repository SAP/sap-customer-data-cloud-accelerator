/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path')
const fs = require('fs')

const { setScreenSetsRequest, getScreenSetsRequest } = require('../services/gigya/gigya.helpers')

const deployWebScreenSets = async ({ gigya, apiKey, dataCenter, buildDirectory }) => {
    // Get screenSets to use html for deploy
    const screenSetsRes = await getScreenSetsRequest(gigya, { apiKey, dataCenter, include: 'screenSetID,html,css,javascript,translations,metadata' })
    if (screenSetsRes.errorCode) {
        throw new Error(JSON.stringify(screenSetsRes))
    }
    if (!screenSetsRes.screenSets.length) {
        throw new Error('There are no screenSets in this site. Please navigate to the UI Builder in the browser to automatically generate the default screenSets, then try again.')
    }
    const { screenSets: originalScreenSets } = screenSetsRes

    await Promise.all(
        fs.readdirSync(buildDirectory).map(async (screenSetID) => {
            const jsFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.js`)
            const cssFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.css`)
            // Get compiled files
            let data = {}

            const javascript = !fs.existsSync(jsFilename) ? '' : fs.readFileSync(jsFilename, { encoding: 'utf8' })
            if (javascript) {
                data.javascript = javascript
            }

            const css = !fs.existsSync(cssFilename) ? '' : fs.readFileSync(cssFilename, { encoding: 'utf8' })
            if (css) {
                data.css = css
            }

            const originalScreenSet = originalScreenSets.find((screenSet) => screenSet.screenSetID === screenSetID)

            // Check if it's a valid screen-set directory
            if (!originalScreenSet) {
                return true
            }

            // because html is required, get it using request
            if (!originalScreenSet.html) {
                throw new Error(`Original screenSet html is not available: ${json.stringify(originalScreenSet)}`)
            }
            data.html = originalScreenSet.html

            if (!Object.keys(data).length) {
                console.log(`Nothing to deploy for: ${screenSetID}`)
                return true
            }

            // Update screenSet on gigya
            const response = await setScreenSetsRequest(gigya, { apiKey, dataCenter, screenSetID, ...data })
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }
        }),
    )
}

module.exports = { deployWebScreenSets }
