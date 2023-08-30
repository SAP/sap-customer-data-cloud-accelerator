import ToolkitSchema from '../sap-cdc-toolkit/copyConfig/schema/schema'
import {BUILD_DIRECTORY, SRC_DIRECTORY} from '../constants.js'
import fs from 'fs'
import path from 'path'
import {clearDirectoryContents} from "../utils/utils";
import Feature from "./feature";

class Schema {
    #credentials
    static DATA_SCHEMA_FILE_NAME = 'data.json'
    static PROFILE_SCHEMA_FILE_NAME = 'profile.json'
    static SUBSCRIPTIONS_SCHEMA_FILE_NAME = 'subscriptions.json'

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return 'schema'
    }

    async init(apiKey, siteConfig, siteDomain, reset) {
        const toolkitSchema = new ToolkitSchema(this.#credentials, apiKey, siteConfig.dataCenter)
        const schemasResponse = await toolkitSchema.get()
        if (schemasResponse.errorCode) {
            throw new Error(JSON.stringify(schemasResponse))
        }

        const srcDirectory = path.join(SRC_DIRECTORY, siteDomain, this.getName())
        Feature.createFolder(srcDirectory, reset)

        // Create files
        fs.writeFileSync(path.join(srcDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.dataSchema, null, 4))
        fs.writeFileSync(path.join(srcDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.profileSchema, null, 4))
        fs.writeFileSync(path.join(srcDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.subscriptionsSchema, null, 4))
    }

    build(siteDomain) {
        clearDirectoryContents(path.join(BUILD_DIRECTORY, siteDomain, this.getName()))
        Feature.copyFileFromSrcToBuild(siteDomain, Schema.DATA_SCHEMA_FILE_NAME, this)
        Feature.copyFileFromSrcToBuild(siteDomain, Schema.PROFILE_SCHEMA_FILE_NAME, this)
        Feature.copyFileFromSrcToBuild(siteDomain, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME, this)
    }
}

export default Schema
