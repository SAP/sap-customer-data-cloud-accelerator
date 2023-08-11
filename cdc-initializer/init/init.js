/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs');
const path = require('path');

const { getSiteConfigRequest } = require('../services/gigya/gigya.helpers');
const {
    FEATURE,
    SRC_DIRECTORY,
    TEMPLATE_WEB_SDK_FILE,
    TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START,
    TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END,
} = require('../constants');
const { runWithProgressAsync } = require('../utils/utils');
const { initWebSdk } = require('./initWebSdk');
const { initWebScreenSets } = require('./initWebScreenSets');
const { initPolicies } = require('./initPolicies');

const init = async ({ gigya, sites, featureName, environment, reset }) => {
    try {
        const initMsg = environment ? `Init start (${environment})` : 'Init start';
        console.log(initMsg);

        handleNoSitesError(sites, environment);

        ensureSrcDirectoryExists();

        for (const { apiKey, siteDomain = '' } of sites) {
            logSiteDetails(siteDomain, apiKey);
            
            const siteConfig = await getSiteConfigRequest(gigya, { apiKey, includeGlobalConf: true });
            if (siteConfig.errorCode) {
                throw new Error(JSON.stringify(siteConfig));
            }

            const { dataCenter } = siteConfig;

            await initializeFeature(FEATURE.WEB_SDK, featureName, initWebSdk, { gigya, apiKey, dataCenter, reset, siteDomain });
            await initializeFeature(FEATURE.WEB_SCREEN_SETS, featureName, initWebScreenSets, { gigya, apiKey, dataCenter, reset, siteDomain });
            await initializeFeature(FEATURE.POLICIES, featureName, initPolicies, { gigya, apiKey, dataCenter, reset, siteDomain });
        }

        const resultMsg = environment ? `Init result (${environment})` : 'Init result';
        console.log(resultMsg + ": \x1b[32mSuccess\x1b[0m");
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `${String(error)}\n`);
        const failMsg = environment ? `Init result (${environment})` : 'Init result';
        console.log(failMsg + ": \x1b[31mFail\x1b[0m");
    }
};

const handleNoSitesError = (sites, environment) => {
    if (!sites) {
        const errorMsg = environment ? `No source sites to use for "${environment}" environment.` : 'No source sites to use.';
        throw new Error(errorMsg);
    }
};

const ensureSrcDirectoryExists = () => {
    if (!fs.existsSync(SRC_DIRECTORY)) {
        fs.mkdirSync(SRC_DIRECTORY);
    }
};

const logSiteDetails = (siteDomain, apiKey) => {
    const logMsg = siteDomain ? `${siteDomain} - ${apiKey}` : `${apiKey}`;
    console.log("\n" + logMsg);
};

const initializeFeature = async (feature, featureName, initFunction, { gigya, apiKey, dataCenter, reset, siteDomain }) => {
    if (feature === featureName || !featureName) {
        let args;
        if (feature === FEATURE.WEB_SDK) {
            args = {
                srcFile: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SDK, `${FEATURE.WEB_SDK}.js`),
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SDK),
                templateWebSdk: TEMPLATE_WEB_SDK_FILE,
            };
        } else if (feature === FEATURE.WEB_SCREEN_SETS) {
            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.WEB_SCREEN_SETS),
                templateJavaScript: TEMPLATE_SCREEN_SET_JAVASCRIPT_FILE,
                templateCssCustomCodeSeparatorStart: TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_START,
                templateCssCustomCodeSeparatorEnd: TEMPLATE_SCREEN_SET_CSS_CUSTOM_CODE_SEPARATOR_END,
            };
        } else if (feature === FEATURE.POLICIES) {
            args = {
                srcDirectory: path.join(SRC_DIRECTORY, siteDomain, FEATURE.POLICIES),
            };
        }

        await runWithProgressAsync({
            name: feature,
            pathMustExist: SRC_DIRECTORY,
            run: async () => await initFunction({ gigya, apiKey, dataCenter, reset, ...args }),
        });
    }
};

module.exports = { init };
