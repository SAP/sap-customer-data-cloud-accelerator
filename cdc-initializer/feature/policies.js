import ToolkitPolicies from '../sap-cdc-toolkit/copyConfig/policies/policies'
import {BUILD_DIRECTORY, SRC_DIRECTORY} from '../constants.js'
import fs from 'fs'
import path from 'path'
import {clearDirectoryContents} from "../utils/utils";
import Feature from "./feature";

class Policies {
    static POLICIES_FILE_NAME = 'policies.json'
    #credentials

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return 'policies'
    }

    async init(apiKey, siteConfig, siteDomain, reset) {
        const toolkitPolicies = new ToolkitPolicies(this.#credentials, apiKey, siteConfig.dataCenter)
        const policiesResponse = await toolkitPolicies.get()
        if (policiesResponse.errorCode) {
            throw new Error(JSON.stringify(policiesResponse))
        }

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, this.getName())
        Feature.createFolder(srcDirectory, reset)

        // Create policy file
        fs.writeFileSync(path.join(srcDirectory, Policies.POLICIES_FILE_NAME), JSON.stringify(policiesResponse, null, 4))
    }

    build(siteDomain) {
        clearDirectoryContents(path.join(BUILD_DIRECTORY, siteDomain, this.getName()))
        Feature.copyFileFromSrcToBuild(siteDomain, Policies.POLICIES_FILE_NAME, this)
    }
}

export default Policies
