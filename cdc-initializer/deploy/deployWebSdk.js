/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs')

const { setSiteConfigRequest } = require('../services/gigya/gigya.helpers')

const deployWebSdk = async ({ gigya, apiKey, buildBundledFile }) => {
    // Get bundled webSdk
    const webSdk = fs.readFileSync(buildBundledFile, { encoding: 'utf8' })
    if (!webSdk || !webSdk.length) {
        throw new Error(`Invalid file: ${buildBundledFile}`)
    }

    // Update webSdk on gigya
    const response = await setSiteConfigRequest(gigya, { apiKey, globalConf: webSdk })
    if (response.errorCode) {
        throw new Error(JSON.stringify(response))
    }
}

module.exports = { deployWebSdk }
