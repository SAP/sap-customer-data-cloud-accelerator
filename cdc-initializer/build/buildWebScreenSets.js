/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START, TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END } from '../constants.js'
import { cleanJavaScriptModuleBoilerplateScreenSetEvents, processMainScriptInlineImports, bundleInlineImportScripts } from '../utils/utils.js'

const buildWebScreenSets = ({ srcDirectory, buildDirectory }) => {
    fs.readdirSync(buildDirectory).forEach((screenSetID) => {
        // Ignore non-directories
        if (!fs.lstatSync(path.join(buildDirectory, screenSetID)).isDirectory()) {
            return true
        }

        fs.readdirSync(path.join(buildDirectory, screenSetID)).forEach((screenSetFilename) => {
            // Ignore javascript file that are not the main one
            if (screenSetFilename !== `${screenSetID}.js`) {
                return true
            }

            // Get JavaScript file from build/
            const jsFilename = path.join(buildDirectory, screenSetID, screenSetFilename)
            // const jsFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.js`)
            let javascript = fs.readFileSync(jsFilename, { encoding: 'utf8' })

            // Bundle all imports in one file
            javascript = bundleInlineImportScripts(javascript, path.join(buildDirectory, screenSetID))

            // Remove screen-set events file boilerplate
            javascript = cleanJavaScriptModuleBoilerplateScreenSetEvents(javascript)

            // Bundle inline imported scripts to the start of the events where they were used
            javascript = processMainScriptInlineImports(javascript)

            // Replace JavaScript file
            fs.writeFileSync(jsFilename, javascript)

            // Remove all build files that are not the main JavaScript file (tests, imported files)
            fs.readdirSync(path.join(buildDirectory, screenSetID)).forEach((screenSetFilename) => {
                if (screenSetFilename !== `${screenSetID}.js`) {
                    fs.rmSync(path.join(buildDirectory, screenSetID, screenSetFilename), { recursive: true, force: true })
                }
            })

            // Get html files from src/ because they are not compiled by babel
            const htmlBuildFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.html`)
            const htmlSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.html`)
            const html = !fs.existsSync(htmlSrcFilename) ? '' : fs.readFileSync(htmlSrcFilename, { encoding: 'utf8' })
            if (html) {
                fs.writeFileSync(htmlBuildFilename, html)
            }

            // Get css files from src/ because they are not compiled by babel
            const cssDefaultSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.default.css`)
            const cssDefault = !fs.existsSync(cssDefaultSrcFilename) ? '' : fs.readFileSync(cssDefaultSrcFilename, { encoding: 'utf8' })

            const cssCustomSrcFilename = path.join(srcDirectory, screenSetID, `${screenSetID}.custom.css`)
            const cssCustom = !fs.existsSync(cssCustomSrcFilename) ? '' : fs.readFileSync(cssCustomSrcFilename, { encoding: 'utf8' })

            // Merge css files in build/
            const cssFilename = path.join(buildDirectory, screenSetID, `${screenSetID}.css`)
            const css = !cssCustom
                ? cssDefault
                : `${cssDefault}\n\n${TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START}\n\n${cssCustom}\n\n${TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END}\n`
            if (css) {
                fs.writeFileSync(cssFilename, css)
            }
        })
    })
}

export { buildWebScreenSets }
