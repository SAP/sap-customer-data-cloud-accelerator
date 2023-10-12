import PartnerFeature from './partnerFeature.js'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../../cdc-accelerator/sap-cdc-toolkit/gigya/client.js'
import 'dotenv/config'
export default class PermissionGroups extends PartnerFeature {
    static PERMISSIONGROUP_FILE_NAME = 'permissionGroups.json'
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        const getPartnerID = siteConfig['partnerId']
        const { USER_KEY, SECRET_KEY } = process.env
        if (!getPartnerID || getPartnerID.errorCode) {
            console.error(`Failed to retrieve partnerID for apiKey "${apiKey}"`)
            throw new Error(JSON.stringify(getPartnerID))
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        // Get permission groups
        const permissionGroupsRes = await this.getPermissionGroups(apiKey, siteConfig['dataCenter'], getPartnerID, USER_KEY, SECRET_KEY)

        if (permissionGroupsRes.errorCode) {
            throw new Error(JSON.stringify(permissionGroupsRes))
        }

        // Create permissionGroups file
        fs.writeFileSync(path.join(featureDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME), JSON.stringify(permissionGroupsRes, null, 4))
    }

    reset(directory) {
        this.deleteDirectory(path.join(directory, this.getName()))
    }

    build(directory) {
        const buildFeaturePath = path.join(directory, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, 'permissionGroups.json')
    }

    async deploy(directory) {
        console.log('deploy called')
    }
    async getPermissionGroups(apiKey, dataCenter, partnerID, userKey, secret) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getGroups`
        const response = await client.post(url, this.#setPermissionGroupsParameters(apiKey, partnerID, userKey, secret)).catch((error) => error)
        return response.data
    }
    // async set(apiKey, config, targetDataCenter) {
    //     const url = UrlBuilder.buildUrl(Policy.#NAMESPACE, targetDataCenter, Policy.#SET_ENDPOINT)
    //     const response = await client.post(url, this.#setPolicyConfigParameters(apiKey, config)).catch(function (error) {
    //         return generateErrorResponse(error, Policy.#ERROR_SET_POLICY_CONFIG)
    //     })
    //     return response.data
    // }
    #setPermissionGroupsParameters(apiKey, partnerID, userKey, secret) {
        const parameters = Object.assign({})
        parameters.apiKey = apiKey
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        return parameters
    }
}
