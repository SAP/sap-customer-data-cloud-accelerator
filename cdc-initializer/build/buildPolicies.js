/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs')

const { clearDirectoryContents } = require('../utils/utils')

const buildPolicies = ({ srcFile, buildFile, buildDirectory }) => {
    // Get file policies file
    const policies = JSON.parse(fs.readFileSync(srcFile, { encoding: 'utf8' }))

    // Clear output directory
    clearDirectoryContents(buildDirectory)

    // Save policies if in output directory
    fs.writeFileSync(buildFile, JSON.stringify(policies, null, 4))
}

module.exports = { buildPolicies }
