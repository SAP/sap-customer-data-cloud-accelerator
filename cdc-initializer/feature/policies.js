/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import ToolkitPolicies from '../sap-cdc-toolkit/copyConfig/policies/policies'
import ToolkitPolicyOptions from '../sap-cdc-toolkit/copyConfig/policies/policyOptions'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from '../constants.js'
import fs from 'fs'
import path from 'path'
import { clearDirectoryContents } from '../utils/utils'
import Feature from './feature'

export default class Policies {
    static POLICIES_FILE_NAME = 'policies.json'
    #credentials

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDomain) {
        const toolkitPolicies = new ToolkitPolicies(this.#credentials, apiKey, siteConfig.dataCenter)
        const policiesResponse = await toolkitPolicies.get()
        if (policiesResponse.errorCode) {
            throw new Error(JSON.stringify(policiesResponse))
        }

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, this.getName())
        Feature.createFolder(srcDirectory)

        // Create policy file
        fs.writeFileSync(path.join(srcDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(policiesResponse, null, 4))
    }

    reset(siteDomain) {
        Feature.deleteFolder(path.join(SRC_DIRECTORY, siteDomain, this.getName()))
    }

    build(siteDomain) {
        clearDirectoryContents(path.join(BUILD_DIRECTORY, siteDomain, this.getName()))
        Feature.copyFileFromSrcToBuild(siteDomain, Policies.POLICIES_FILE_NAME, this)
    }

    async deploy(apiKey, siteConfig, siteDomain) {
        const buildFeatureDirectory = path.join(BUILD_DIRECTORY, siteDomain, this.getName())
        // Get file policies file
        const policiesContent = JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Policies.POLICIES_FILE_NAME), { encoding: 'utf8' }))    
        const response =  await this.deployUsingToolkit(apiKey, siteConfig, policiesContent,  new ToolkitPolicyOptions()) 
    }
    
    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitPolicies = new ToolkitPolicies(this.#credentials, apiKey, siteConfig.dataCenter)
        await toolkitPolicies.copyPolicies(apiKey, siteConfig, payload, options)
    }
}
