/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import ToolkitSchema from '../sap-cdc-toolkit/copyConfig/schema/schema'
import ToolkitSchemaOptions from '../sap-cdc-toolkit/copyConfig/schema/schemaOptions'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from '../constants.js'
import fs from 'fs'
import path from 'path'
import { clearDirectoryContents } from '../utils/utils'
import Feature from './feature'

export default class Schema {
    #credentials
    static DATA_SCHEMA_FILE_NAME = 'data.json'
    static PROFILE_SCHEMA_FILE_NAME = 'profile.json'
    static SUBSCRIPTIONS_SCHEMA_FILE_NAME = 'subscriptions.json'

    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
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

    async deploy(apiKey, siteConfig, siteDomain) {
        const buildFeatureDirectory = path.join(BUILD_DIRECTORY, siteDomain, this.getName())
        const rawFile = fs.readFileSync(path.join(buildFeatureDirectory, Schema.DATA_SCHEMA_FILE_NAME), { encoding: 'utf8' })

        const payload = {
            dataSchema: JSON.parse(rawFile),
            profileSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
            subscriptionsSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
        }
        await this.deployUsingToolkit(apiKey, siteConfig, payload, new ToolkitSchemaOptions())
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitSchema = new ToolkitSchema(this.#credentials, apiKey, siteConfig.dataCenter)
        await toolkitSchema.copySchema(apiKey, siteConfig, payload, options)
    }
}
