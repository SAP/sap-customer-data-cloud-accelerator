/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path')

const { setConsentsStatementsRequest, setLegalStatementsRequest } = require('../services/gigya/gigya.helpers')
const { readJsonFile } = require('../utils/utils')
const { getLegalFolders, getLegalFilesAndLanguages, getParamsForConsentsStatements, getParamsForLegalStatement } = require('../utils/utilsConsents')

const deployConsentStatements = async ({ gigya, apiKey, dataCenter, buildFile, buildLegalStatementsDirectory }) => {
    const consents = readJsonFile(buildFile).preferences
    const result = await setConsentsStatementsRequest(gigya, getParamsForConsentsStatements(apiKey, dataCenter, consents))
    if (result.errorCode) {
        throw new Error(result.errorDetails)
    }

    const legalFolders = getLegalFolders(buildLegalStatementsDirectory)
    for (const legalFolder of legalFolders) {
        const legalPath = path.join(buildLegalStatementsDirectory, legalFolder)
        const legalFilesAndLanguages = getLegalFilesAndLanguages(legalPath)

        for (const { legalFile, lang } of legalFilesAndLanguages) {
            const legal = readJsonFile(path.join(legalPath, legalFile))
            const legalJson = legal.legalStatements

            const result = await setLegalStatementsRequest(gigya, getParamsForLegalStatement(apiKey, dataCenter, legalFolder, lang, legalJson))
            if (result.errorCode) {
                console.log('\x1b[33m%s\x1b[0m', `[errorCode: ${result.errorCode}] ${result.errorDetails}.`)
            }
        }
    }
}

module.exports = { deployConsentStatements }
