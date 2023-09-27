/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitPolicies from '../sap-cdc-toolkit/copyConfig/policies/policies.js'
import ToolkitPolicyOptions from '../sap-cdc-toolkit/copyConfig/policies/policyOptions.js'
import fs from 'fs'
import path from 'path'
import { clearDirectoryContents } from '../utils/utils.js'
import SiteFeature from './siteFeature.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'

export default class Policies extends SiteFeature {
    static POLICIES_FILE_NAME = 'policies.json'

    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        const toolkitPolicies = new ToolkitPolicies(this.credentials, apiKey, siteConfig.dataCenter)
        const policiesResponse = await toolkitPolicies.get()
        if (policiesResponse.errorCode) {
            throw new Error(JSON.stringify(policiesResponse))
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        // Create policy file
        this.removeResponseStatusFields(policiesResponse)
        fs.writeFileSync(path.join(featureDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(policiesResponse, null, 4))
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {
        const buildFeaturePath = path.join(sitePath, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, Policies.POLICIES_FILE_NAME)
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.getName())
        const toolkitPolicies = new ToolkitPolicies(this.credentials, apiKey, siteConfig.dataCenter)

        // Get file policies file
        const policiesContent = JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Policies.POLICIES_FILE_NAME), { encoding: 'utf8' }))

        const response = await toolkitPolicies.copyPolicies(apiKey, siteConfig, policiesContent, new ToolkitPolicyOptions())
        if (response.errorCode) {
            throw new Error(JSON.stringify(response))
        }
    }

    removeResponseStatusFields(policiesResponse) {
        delete policiesResponse.statusCode
        delete policiesResponse.errorCode
        delete policiesResponse.statusReason
        delete policiesResponse.callId
        delete policiesResponse.time
    }
}
