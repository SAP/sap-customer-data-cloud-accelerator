/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { FEATURE, FEATURE_NAME_LIST, SRC_DIRECTORY, BUILD_DIRECTORY } from '../constants.js'
import { runWithProgress } from '../utils/utils.js'
import { buildWebSdk } from './buildWebSdk.js'
import { buildWebScreenSets } from './buildWebScreenSets.js'
import { buildEmailTemplates } from './buildEmailTemplates.js'
import { buildPolicies } from './buildPolicies.js'
import { buildSchema } from './buildSchema.js'
import { buildPermissionGroups } from './buildPermissionGroups.js'
import { buildConsentStatements } from './buildConsentStatements.js'
import { buildAcls } from './buildAcls.js'

const build = () => {
    try {
        console.log('\nBuild start')

        // Get all directories in src/ that are not features and check if they have features inside (Also '' to check the src/ directory itself)
        const sites = ['', ...fs.readdirSync(SRC_DIRECTORY).filter((DIR) => !FEATURE_NAME_LIST.includes(DIR) && fs.existsSync(`${SRC_DIRECTORY}${DIR}/`))]

        // Loop all site directories and run build fuction for each
        for (const siteDomain of sites) {
            console.log(`\n${path.join(SRC_DIRECTORY, siteDomain)}`)
            let args = {}

            args = {
                buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.WEB_SDK, `${FEATURE.WEB_SDK}.js`),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.WEB_SDK),
                buildBundledFile: path.join(BUILD_DIRECTORY, siteDomain, `${FEATURE.WEB_SDK}.js`),
            }
            runWithProgress({ name: FEATURE.WEB_SDK, pathMustExist: args.buildFile, run: () => buildWebSdk(args) })

            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SCREEN_SETS),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.WEB_SCREEN_SETS),
            }
            runWithProgress({ name: FEATURE.WEB_SCREEN_SETS, pathMustExist: args.buildDirectory, run: () => buildWebScreenSets(args) })

            args = {
                srcTemplatesDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.EMAIL_TEMPLATES, 'templates'),
                srcLocalesDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.EMAIL_TEMPLATES, 'locales'),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.EMAIL_TEMPLATES),
            }
            runWithProgress({ name: FEATURE.EMAIL_TEMPLATES, pathMustExist: args.srcTemplatesDirectory, run: () => buildEmailTemplates(args) })

            args = {
                srcFile: path.join(SRC_DIRECTORY, siteDomain, FEATURE.POLICIES, `${FEATURE.POLICIES}.json`),
                buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.POLICIES, `${FEATURE.POLICIES}.json`),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.POLICIES),
            }
            runWithProgress({ name: FEATURE.POLICIES, pathMustExist: args.srcFile, run: () => buildPolicies(args) })

            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.SCHEMA),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.SCHEMA),
            }
            runWithProgress({ name: FEATURE.SCHEMA, pathMustExist: args.srcDirectory, run: () => buildSchema(args) })

            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS),
            }
            runWithProgress({ name: FEATURE.PERMISSION_GROUPS, pathMustExist: args.srcDirectory, run: () => buildPermissionGroups(args) })

            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS, FEATURE.ACLS),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS, FEATURE.ACLS),
            }
            runWithProgress({ name: FEATURE.ACLS, pathMustExist: args.srcDirectory, run: () => buildAcls(args) })

            args = {
                srcFile: path.join(SRC_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, `${FEATURE.CONSENT_STATEMENTS}.json`),
                buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS),
                buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, `${FEATURE.CONSENT_STATEMENTS}.json`),
                srcLegalStatementsDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, 'legalStatements'),
                buildLegalStatementsDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, 'legalStatements'),
            }
            runWithProgress({ name: FEATURE.CONSENT_STATEMENTS, pathMustExist: args.srcFile, run: () => buildConsentStatements(args) })
        }

        console.log('\nBuild result: \x1b[32m%s\x1b[0m\n', `Success`)
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`)
        console.log('Build result: \x1b[31m%s\x1b[0m', `Fail\n`)
    }
}

build()
