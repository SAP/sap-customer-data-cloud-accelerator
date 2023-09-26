/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import { getOutputTemplates, getParamsSetEmailTemplates } from '../utils/utilsEmailTemplates.js'
import { setEmailTemplatesRequest } from '../services/gigya/gigya.helpers.js'

const deployEmailTemplates = async ({ gigya, apiKey, dataCenter, buildDirectory }) => {
    // Get all files in the output folder
    const outputTemplates = getOutputTemplates(buildDirectory)

    // Save output templates in CDC
    const params = getParamsSetEmailTemplates(outputTemplates)
    const response = await setEmailTemplatesRequest(gigya, { apiKey, dataCenter, ...params })
    if (response.errorCode) {
        throw new Error(JSON.stringify(response))
    }
}

export { deployEmailTemplates }
