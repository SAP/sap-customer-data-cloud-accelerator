/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import ToolkitSchema from '../sap-cdc-toolkit/copyConfig/schema/schema'
import ToolkitSchemaOptions from '../sap-cdc-toolkit/copyConfig/schema/schemaOptions'
import fs from 'fs'
import path from 'path'
import { clearDirectoryContents } from '../utils/utils'
import SiteFeature from './siteFeature'
import FolderManager from './folderManager'

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

    async init(apiKey, siteConfig, siteDomain) {
        const toolkitSchema = new ToolkitSchema(this.credentials, apiKey, siteConfig.dataCenter)
        const schemasResponse = await toolkitSchema.get()
        if (schemasResponse.errorCode) {
            throw new Error(JSON.stringify(schemasResponse))
        }

        const featureDirectory = path.join(await this.folderManager.getSiteFolder('init', apiKey), this.getName())
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
        let featurePath
        if (sitePath.startsWith(FolderManager.BUILD_DIRECTORY)) {
            featurePath = path.join(sitePath.replace(FolderManager.BUILD_DIRECTORY, FolderManager.SRC_DIRECTORY), this.getName())
        } else {
            featurePath = path.join(sitePath, this.getName())
        }
        clearDirectoryContents(featurePath.replace(FolderManager.SRC_DIRECTORY, FolderManager.BUILD_DIRECTORY))
        this.copyFileFromSrcToBuild(featurePath, Schema.DATA_SCHEMA_FILE_NAME)
        this.copyFileFromSrcToBuild(featurePath, Schema.PROFILE_SCHEMA_FILE_NAME)
        this.copyFileFromSrcToBuild(featurePath, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME)
    }

    async deploy(apiKey, siteConfig) {
        const buildFeatureDirectory = path.join(await this.folderManager.getSiteFolder('deploy', apiKey), this.getName())
        const rawFile = fs.readFileSync(path.join(buildFeatureDirectory, Schema.DATA_SCHEMA_FILE_NAME), { encoding: 'utf8' })

        const payload = {
            dataSchema: JSON.parse(rawFile),
            profileSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.PROFILE_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
            subscriptionsSchema: JSON.parse(fs.readFileSync(path.join(buildFeatureDirectory, Schema.SUBSCRIPTIONS_SCHEMA_FILE_NAME), { encoding: 'utf8' })),
        }
        await this.deployUsingToolkit(apiKey, siteConfig, payload, new ToolkitSchemaOptions())
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitSchema = new ToolkitSchema(this.credentials, apiKey, siteConfig.dataCenter)
        await toolkitSchema.copySchema(apiKey, siteConfig, payload, options)
    }
}
