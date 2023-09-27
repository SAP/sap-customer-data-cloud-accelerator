/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { readJsonFile } from '../utils/utils.js'

const getLegalFolders = (directory) => fs.readdirSync(directory)

const getLegalFilesAndLanguages = (directory) => {
    const legalFiles = fs.readdirSync(directory)
    return legalFiles.map((legalFile) => {
        const lang = legalFile.replace('.json', '')
        const legal = readJsonFile(path.join(directory, legalFile))
        return {
            legalFile,
            lang,
            legalJson: legal.legalStatements,
        }
    })
}

const getParamsForConsentsStatements = (apiKey, dataCenter, consents) => ({
    apiKey,
    dataCenter,
    preferences: JSON.stringify(consents),
})

const getParamsForLegalStatement = (apiKey, dataCenter, consentId, lang, legalStatements) => ({
    apiKey,
    dataCenter,
    consentId,
    lang,
    legalStatements: JSON.stringify(legalStatements),
})

export { getLegalFolders, getLegalFilesAndLanguages, getParamsForConsentsStatements, getParamsForLegalStatement }
