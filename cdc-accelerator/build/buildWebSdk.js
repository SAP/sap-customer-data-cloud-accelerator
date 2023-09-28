/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'

import { cleanJavaScriptModuleBoilerplateWebSdk, replaceFilenamesWithFileContents } from '../utils/utils.js'

const buildWebSdk = ({ buildFile, buildDirectory, buildBundledFile }) => {
    let webSdk = fs.readFileSync(buildFile, { encoding: 'utf8' })
    webSdk = cleanJavaScriptModuleBoilerplateWebSdk(webSdk)

    // Find filenames and replace them with the contents of the file
    let webSdkBundled = replaceFilenamesWithFileContents(webSdk, buildDirectory).trim()

    // Write the result file
    fs.writeFileSync(buildBundledFile, webSdkBundled)

    // Remove webSdk/ directory
    fs.rmSync(buildDirectory, { recursive: true, force: true })
}

export { buildWebSdk }
