/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path')

const { CONFIG_FILENAME, FEATURE, BUILD_DIRECTORY } = require('../constants')
const config = require(`../../${CONFIG_FILENAME}`)
const Gigya = require('../services/gigya/gigya')
const { getSiteConfigRequest } = require('../services/gigya/gigya.helpers')
const { parseArguments, runWithProgressAsync } = require('../utils/utils')
const { deployWebSdk } = require('./deployWebSdk')
const { deployWebScreenSets } = require('./deployWebScreenSets')
const { deployEmailTemplates } = require('./deployEmailTemplates')
const { deployPolicies } = require('./deployPolicies')
const { deploySchema } = require('./deploySchema')
const { deployAcls} = require('./deployAcls')
const { deployPermissionGroups } = require('./deployPermissionGroups')
const { deployConsentStatements } = require('./deployConsentStatements')

require('dotenv').config()
const { USER_KEY, SECRET_KEY } = process.env
const gigya = new Gigya(USER_KEY, SECRET_KEY)

const deploy = async ({ gigya, sites, featureName, environment }) => {
    try {
        console.log(`Deploy start${environment ? ` (${environment})` : ''}`)

        if (!sites) {
            if (environment) {
                throw new Error(`No deploy sites to use for "${environment}" environment.`)
            } else {
                throw new Error(`No deploy sites to use.`)
            }
        }

        for (const { apiKey, siteDomain = '' } of sites) {
            // If apiKey has siteDomain, use the contents inside that directory for that site, else use the contents of the build/ directory
            if (siteDomain) {
                console.log(`\n${siteDomain} - ${apiKey}`)
            } else {
                console.log(`\n${apiKey}`)
            }

            // Check if site exists
            const siteConfig = await getSiteConfigRequest(gigya, { apiKey })
            if (siteConfig.errorCode) {
                throw new Error(JSON.stringify(siteConfig))
            }
            const { dataCenter } = siteConfig

            if (FEATURE.WEB_SDK === featureName || !featureName) {
                const args = { buildBundledFile: path.join(BUILD_DIRECTORY, siteDomain, `${FEATURE.WEB_SDK}.js`) }
                await runWithProgressAsync({
                    name: FEATURE.WEB_SDK,
                    pathMustExist: args.buildBundledFile,
                    run: async () => await deployWebSdk({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.WEB_SCREEN_SETS === featureName || !featureName) {
                const args = { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.WEB_SCREEN_SETS) }
                await runWithProgressAsync({
                    name: FEATURE.WEB_SCREEN_SETS,
                    pathMustExist: args.buildDirectory,
                    run: async () => await deployWebScreenSets({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.EMAIL_TEMPLATES === featureName || !featureName) {
                const args = { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.EMAIL_TEMPLATES) }
                await runWithProgressAsync({
                    name: FEATURE.EMAIL_TEMPLATES,
                    pathMustExist: args.buildDirectory,
                    run: async () => await deployEmailTemplates({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.POLICIES === featureName || !featureName) {
                const args = { buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.POLICIES, `${FEATURE.POLICIES}.json`) }
                await runWithProgressAsync({
                    name: FEATURE.POLICIES,
                    pathMustExist: args.buildFile,
                    run: async () => await deployPolicies({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.SCHEMA === featureName || !featureName) {
                const args = { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.SCHEMA) }
                await runWithProgressAsync({
                    name: FEATURE.SCHEMA,
                    pathMustExist: args.buildDirectory,
                    run: async () => await deploySchema({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.ACLS === featureName || !featureName) {
                const args = { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS, FEATURE.ACLS) }
                await runWithProgressAsync({
                    name: FEATURE.ACLS,
                    pathMustExist: args.buildDirectory,
                    run: async () => await deployAcls({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.PERMISSION_GROUPS === featureName || !featureName) {
                const args = { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS) }
                await runWithProgressAsync({
                    name: FEATURE.PERMISSION_GROUPS,
                    pathMustExist: args.buildDirectory,
                    run: async () => await deployPermissionGroups({ gigya, apiKey, dataCenter, ...args }),
                })
            }
            if (FEATURE.CONSENT_STATEMENTS === featureName || !featureName) {
                const args = {
                    buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, `${FEATURE.CONSENT_STATEMENTS}.json`),
                    buildLegalStatementsDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, 'legalStatements'),
                }
                await runWithProgressAsync({
                    name: FEATURE.CONSENT_STATEMENTS,
                    pathMustExist: args.buildFile,
                    run: async () => await deployConsentStatements({ gigya, apiKey, dataCenter, ...args }),
                })
            }
        }

        console.log(`\nDeploy result${environment ? ` (${environment})` : ''}: \x1b[32m%s\x1b[0m\n`, `Success`)
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
        console.log(`Deploy result${environment ? ` (${environment})` : ''}: \x1b[31m%s\x1b[0m\n`, `Fail`)
    }
}

const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.deploy })
deploy({ gigya, sites, featureName, environment })
