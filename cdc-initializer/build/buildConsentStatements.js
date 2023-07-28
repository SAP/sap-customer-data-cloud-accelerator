/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs')
const path = require('path')

const { clearDirectoryContents, readJsonFile } = require('../utils/utils')

const buildConsentStatements = ({ srcFile, buildFile, buildDirectory, srcLegalStatementsDirectory, buildLegalStatementsDirectory }) => {
    // Get consents file
    const consents = readJsonFile(srcFile)
    // Clear output directory
    clearDirectoryContents(buildDirectory)

    // Save consents in output directory
    fs.writeFileSync(buildFile, JSON.stringify(consents, null, 4))

    buildLegalStatements({ srcLegalStatementsDirectory, buildLegalStatementsDirectory })
}

const buildLegalStatements = ({ srcLegalStatementsDirectory, buildLegalStatementsDirectory }) => {
    const legalFolders = fs.readdirSync(srcLegalStatementsDirectory)

    for (const legalFolder of legalFolders) {
        configureLegalStatementsForFolder({ legalFolder, srcLegalStatementsDirectory, buildLegalStatementsDirectory })
    }
}

const configureLegalStatementsForFolder = ({ legalFolder, srcLegalStatementsDirectory, buildLegalStatementsDirectory }) => {
    const legalPath = path.join(srcLegalStatementsDirectory, legalFolder)
    const legalFiles = fs.readdirSync(legalPath)

    // Clear the output directory for the current legal folder
    const outputDirectory = path.join(buildLegalStatementsDirectory, legalFolder)
    // Create output directory
    fs.mkdirSync(outputDirectory, { recursive: true })

    for (const legalFile of legalFiles) {
        const legal = readJsonFile(path.join(legalPath, legalFile))

        // Save legal statements in the output directory
        fs.writeFileSync(path.join(outputDirectory, legalFile), JSON.stringify(legal, null, 4))
    }
}

module.exports = { buildConsentStatements }
