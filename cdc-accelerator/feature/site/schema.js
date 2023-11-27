/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitSchema from '../../sap-cdc-toolkit/copyConfig/schema/schema.js'
import ToolkitSchemaOptions from '../../sap-cdc-toolkit/copyConfig/schema/schemaOptions.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from '../siteFeature.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../core/constants.js'

export default class Schema extends SiteFeature {
    static DATA_SCHEMA_FILE_NAME = 'data.json'
    static PROFILE_SCHEMA_FILE_NAME = 'profile.json'
    static SUBSCRIPTIONS_SCHEMA_FILE_NAME = 'subscriptions.json'

    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        const toolkitSchema = new ToolkitSchema(this.credentials, apiKey, siteConfig.dataCenter)
        const schemasResponse = await toolkitSchema.get()
        if (schemasResponse.errorCode) {
            throw new Error(JSON.stringify(schemasResponse))
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        // Create files
        fs.writeFileSync(path.join(featureDirectory, Schema.DATA_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.dataSchema, null, 4))
        fs.writeFileSync(path.join(featureDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.profileSchema, null, 4))
        fs.writeFileSync(path.join(featureDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), JSON.stringify(schemasResponse.subscriptionsSchema, null, 4))
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {
        const buildFeaturePath = path.join(sitePath, this.getName())
        this.clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, Schema.DATA_SCHEMA_FILE_NAME)
        this.copyFileFromSrcToBuild(srcFeaturePath, Schema.PROFILE_SCHEMA_FILE_NAME)
        this.copyFileFromSrcToBuild(srcFeaturePath, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME)
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.getName())
        const rawFile = fs.readFileSync(path.join(buildFeatureDirectory, Schema.DATA_SCHEMA_FILE_NAME), { encoding: 'utf8' })

        const payload = {
            dataSchema: JSON.parse(rawFile),
            profileSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
            subscriptionsSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
        }
        const response = await this.deployUsingToolkit(apiKey, siteConfig, payload, new ToolkitSchemaOptions())
        const isAnyError = response.some((res) => {
            return res.errorCode !== 0
        })
        if (isAnyError) {
            throw new Error(JSON.stringify(response))
        }
        return response
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitSchema = new ToolkitSchema(this.credentials, apiKey, siteConfig.dataCenter)
        return await toolkitSchema.copySchema(apiKey, siteConfig, payload, options)
    }
}
