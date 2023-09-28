/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'

const initWebSdk = async ({ reset, siteConfig, srcFile, srcDirectory, templateWebSdk }) => {
    let { globalConf: originalWebSdk } = siteConfig

    // If globalConf is empty, get default template
    if (!originalWebSdk) {
        originalWebSdk = fs.readFileSync(`${templateWebSdk}`, { encoding: 'utf8' })
    }

    // Wrap javascript in "module"
    const webSdk = `export default ${originalWebSdk}`

    // Check if webSdk directory already exists
    if (fs.existsSync(srcDirectory)) {
        if (!reset) {
            throw new Error(`The "${srcDirectory}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
        }

        // Remove existing src/webSdk directory if "reset" is enabled,
        fs.rmSync(srcDirectory, { recursive: true, force: true })
    }

    // Create directory
    fs.mkdirSync(srcDirectory, { recursive: true })

    // Create new webSdk file
    fs.writeFileSync(srcFile, webSdk)
}

export { initWebSdk }
