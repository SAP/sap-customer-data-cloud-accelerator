/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { getSiteConfigRequest } from '../services/gigya/gigya.helpers.js'
import {
    FEATURE,
    SRC_DIRECTORY,
    TEMPLATE_WEB_SDK_FILE,
    TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END,
} from '../constants.js'
import { runWithProgressAsync } from '../utils/utils.js'
import { initWebSdk } from './initWebSdk.js'
import { initWebScreenSets } from './initWebScreenSets.js'
import { initPolicies } from './initPolicies.js'

const init = async ({ gigya, sites, featureName, environment, reset }) => {
    try {
        console.log(`Init start${environment ? ` (${environment})` : ''}`)

        if (!sites) {
            if (environment) {
                throw new Error(`No source sites to use for "${environment}" environment.`)
            } else {
                throw new Error(`No source sites to use.`)
            }
        }

        // Create src/ directory if it doesn't exist
        if (!fs.existsSync(SRC_DIRECTORY)) {
            fs.mkdirSync(SRC_DIRECTORY)
        }

        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            if (siteDomain) {
                console.log(`\n${siteDomain} - ${apiKey}`)
            } else {
                console.log(`\n${apiKey}`)
            }

            // Get site config
            const siteConfig = await getSiteConfigRequest(gigya, { apiKey, includeGlobalConf: true })
            if (siteConfig.errorCode) {
                throw new Error(JSON.stringify(siteConfig))
            }
            const { dataCenter } = siteConfig

            if (FEATURE.WEB_SDK === featureName || !featureName) {
                let args = {
                    srcFile: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SDK, `${FEATURE.WEB_SDK}.js`),
                    srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SDK),
                    templateWebSdk: TEMPLATE_WEB_SDK_FILE,
                    siteConfig,
                }
                await runWithProgressAsync({
                    name: FEATURE.WEB_SDK,
                    pathMustExist: SRC_DIRECTORY,
                    run: async () => await initWebSdk({ gigya, apiKey, dataCenter, reset, ...args }),
                })
            }

            if (FEATURE.WEB_SCREEN_SETS === featureName || !featureName) {
                let args = {
                    srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SCREEN_SETS),
                    templateJavaScript: TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE,
                    templateCssCustomCodeSeparatorStart: TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START,
                    templateCssCustomCodeSeparatorEnd: TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END,
                }
                await runWithProgressAsync({
                    name: FEATURE.WEB_SCREEN_SETS,
                    pathMustExist: SRC_DIRECTORY,
                    run: async () => await initWebScreenSets({ gigya, apiKey, dataCenter, reset, ...args }),
                })
            }

            if (FEATURE.POLICIES === featureName || !featureName) {
                let args = {
                    srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.POLICIES),
                }
                await runWithProgressAsync({
                    name: FEATURE.POLICIES,
                    pathMustExist: SRC_DIRECTORY,
                    run: async () => await initPolicies({ gigya, apiKey, dataCenter, reset, ...args }),
                })
            }
        }

        console.log(`\nInit result${environment ? ` (${environment})` : ''}: \x1b[32m%s\x1b[0m\n`, `Success`)
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
        console.log(`Init result${environment ? ` (${environment})` : ''}: \x1b[31m%s\x1b[0m\n`, `Fail`)
    }
}

export { init }
