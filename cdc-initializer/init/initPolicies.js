/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs')
const path = require('path')

const { getPoliciesRequest } = require('../services/gigya/gigya.helpers')

const initPolicies = async ({ gigya, apiKey, dataCenter, reset, srcDirectory }) => {
    // Get policies
    const policyRes = await getPoliciesRequest(gigya, { apiKey, dataCenter })

    if (policyRes.errorCode) {
        throw new Error(JSON.stringify(policyRes))
    }

    // Check if policies directory already exists
    if (fs.existsSync(srcDirectory)) {
        if (!reset) {
            throw new Error(`The "${srcDirectory}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
        }

        // Remove existing src/policies directory if "reset" is enabled
        fs.rmSync(srcDirectory, { recursive: true, force: true })
    }

    // Create directory
    fs.mkdirSync(srcDirectory, { recursive: true })

    // Create file path for the policy
    const srcFile = path.join(srcDirectory, `policies.json`)

    // Create policy file
    fs.writeFileSync(srcFile, JSON.stringify(policyRes, null, 4))  
}

module.exports = { initPolicies }
