/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitPolicies from '../../sap-cdc-toolkit/copyConfig/policies/policies.js'
import ToolkitPolicyOptions from '../../sap-cdc-toolkit/copyConfig/policies/policyOptions.js'
import { removePropertyFromObjectCascading } from '../../sap-cdc-toolkit/copyConfig/objectHelper.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from '../siteFeature.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../core/constants.js'

export default class Policies extends SiteFeature {
    static POLICIES_FILE_NAME = 'policies.json'

    constructor(credentials) {
        super(credentials)
    }

    getType() {
        return super.constructor.name
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

        const filteredPoliciesResponse = this.#removeEmailTemplates(policiesResponse)
        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        this.#removeResponseStatusFields(filteredPoliciesResponse)
        fs.writeFileSync(path.join(featureDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(filteredPoliciesResponse, null, 4))
    }

    #removeEmailTemplates(policiesResponse) {
        const filteredPoliciesResponse = JSON.parse(JSON.stringify(policiesResponse))
        removePropertyFromObjectCascading(filteredPoliciesResponse, 'confirmationEmailTemplates')
        removePropertyFromObjectCascading(filteredPoliciesResponse, 'emailTemplates')
        removePropertyFromObjectCascading(filteredPoliciesResponse, 'welcomeEmailTemplates')
        removePropertyFromObjectCascading(filteredPoliciesResponse, 'accountDeletedEmailTemplates')
        return filteredPoliciesResponse
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {
        const srcFeaturePath = path.join(sitePath, this.getName())
        const buildFeaturePath = srcFeaturePath.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
        this.clearDirectoryContents(buildFeaturePath)
        this.copyFileFromSrcToBuild(srcFeaturePath, Policies.POLICIES_FILE_NAME)
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY), this.getName())
        // Get file policies file
        const policiesContent = JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Policies.POLICIES_FILE_NAME), { encoding: 'utf8' }))
        const response = await this.deployUsingToolkit(apiKey, siteConfig, policiesContent, new ToolkitPolicyOptions())
        if (response.errorCode) {
            throw new Error(JSON.stringify(response))
        }
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitPolicies = new ToolkitPolicies(this.credentials, apiKey, siteConfig.dataCenter)
        return await toolkitPolicies.copyPolicies(apiKey, siteConfig, payload, options)
    }

    #removeResponseStatusFields(policiesResponse) {
        delete policiesResponse.statusCode
        delete policiesResponse.errorCode
        delete policiesResponse.statusReason
        delete policiesResponse.callId
        delete policiesResponse.time
    }
}
