/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'

import { setPoliciesRequest } from '../services/gigya/gigya.helpers.js'

const deployPolicies = async ({ gigya, apiKey, dataCenter, buildFile }) => {
    // Get file policies file
    const policies = JSON.parse(fs.readFileSync(buildFile, { encoding: 'utf8' }))

    // Convert policies to params
    const params = Object.fromEntries(Object.entries(policies).map(([key, value]) => [key, JSON.stringify(value)]))

    // Save policies in CDC
    const response = await setPoliciesRequest(gigya, { apiKey, dataCenter, ...params })
    if (response.errorCode) {
        throw new Error(JSON.stringify(response))
    }
}

export { deployPolicies }
