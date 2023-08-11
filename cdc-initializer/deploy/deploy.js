/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const path = require('path');


const { CONFIG_FILENAME, FEATURE, BUILD_DIRECTORY } = require('../constants');
const config = require(`../../${CONFIG_FILENAME}`);
const Gigya = require('../services/gigya/gigya');
const { getSiteConfigRequest } = require('../services/gigya/gigya.helpers');
const { parseArguments, runWithProgressAsync } = require('../utils/utils');
const { deployWebSdk } = require('./deployWebSdk')
const { deployWebScreenSets } = require('./deployWebScreenSets')
const { deployEmailTemplates } = require('./deployEmailTemplates')
const { deployPolicies } = require('./deployPolicies')
const { deploySchema } = require('./deploySchema')
const { deployAcls} = require('./deployAcls')
const { deployPermissionGroups } = require('./deployPermissionGroups')
const { deployConsentStatements } = require('./deployConsentStatements')

const featureDeploymentFunctions = {
    [FEATURE.WEB_SDK]: deployWebSdk,
    [FEATURE.WEB_SCREEN_SETS]: deployWebScreenSets,
    [FEATURE.EMAIL_TEMPLATES]: deployEmailTemplates,
    [FEATURE.POLICIES]: deployPolicies,
    [FEATURE.SCHEMA]: deploySchema,
    [FEATURE.ACLS]: deployAcls,
    [FEATURE.PERMISSION_GROUPS]: deployPermissionGroups,
    [FEATURE.CONSENT_STATEMENTS]: deployConsentStatements,
};

require('dotenv').config();
const { USER_KEY, SECRET_KEY } = process.env;
const gigya = new Gigya(USER_KEY, SECRET_KEY);

const deploy = async ({ gigya, sites, featureName, environment }) => {
    const environmentInfo = environment ? ` (${environment})` : '';
    try {
        console.log(`Deploy start${environmentInfo}`);
        
        if (!sites) throw new Error(environment ? `No deploy sites to use for "${environment}" environment.` : 'No deploy sites to use.');

        for (const site of sites) {
            displaySiteLog(site);

            const siteConfig = await getSiteConfigRequest(gigya, { apiKey: site.apiKey });
            if (siteConfig.errorCode) throw new Error(JSON.stringify(siteConfig));

            await handleFeatureDeployment(site, featureName, siteConfig.dataCenter);
        }
        console.log(`\nDeploy result${environmentInfo}: \x1b[32mSuccess\x1b[0m\n`);
    } catch (error) {
        console.error('\x1b[31m', `${error}\n`);
        console.log(`Deploy result${environmentInfo}: \x1b[31mFail\x1b[0m\n`);
    }
};

function displaySiteLog({ apiKey, siteDomain = '' }) {
    console.log(`\n${siteDomain ? `${siteDomain} - ` : ''}${apiKey}`);
}

async function handleFeatureDeployment(site, featureName, dataCenter) {
    for (const [feature, deployFunction] of Object.entries(featureDeploymentFunctions)) {
        if (feature === featureName || !featureName) {
            const args = constructArgumentsForFeature(site.siteDomain, feature);
            await runWithProgressAsync({
                name: feature,
                pathMustExist: args.buildDirectory || args.buildBundledFile,
                run: async () => await deployFunction({ gigya, apiKey: site.apiKey, dataCenter, ...args }),
            });
        }
    }
}

function constructArgumentsForFeature(siteDomain, feature) {
    if (feature === FEATURE.CONSENT_STATEMENTS) {
        return {
            buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, `${FEATURE.CONSENT_STATEMENTS}.json`),
            buildLegalStatementsDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.CONSENT_STATEMENTS, 'legalStatements')
        };
    }

    if (feature === FEATURE.WEB_SDK) {
        return { buildBundledFile: path.join(BUILD_DIRECTORY, siteDomain, `${FEATURE.WEB_SDK}.js`) };
    }

    if (feature === FEATURE.POLICIES) {
        return { buildFile: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.POLICIES, `${FEATURE.POLICIES}.json`) };
    }

    if (feature === FEATURE.ACLS) {
        return { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, FEATURE.PERMISSION_GROUPS, FEATURE.ACLS) };
    }

    return { buildDirectory: path.join(BUILD_DIRECTORY, siteDomain, feature) };
}

const { sites, featureName, environment } = parseArguments({ args: process.argv, config: config.deploy });
deploy({ gigya, sites, featureName, environment });
