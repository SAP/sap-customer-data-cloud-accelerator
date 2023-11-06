import PartnerFeature from './partnerFeature.js'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../../cdc-accelerator/sap-cdc-toolkit/gigya/client.js'
export default class PermissionGroups extends PartnerFeature {
    static PERMISSIONGROUP_FILE_NAME = 'PermissionGroups.json'
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(partnerDirectory, siteInfo) {
        if (!siteInfo['partnerId']) {
            console.error(`Failed to retrieve partnerID for apiKey "${siteInfo['apiKey']}"`)
            throw new Error(JSON.stringify(siteInfo['partnerId']))
        }

        const featureDirectory = path.join(partnerDirectory, this.getName())
        this.createDirectory(featureDirectory)

        // Get permission groups
        const permissionGroupsRes = await this.getPermissionGroups(siteInfo['dataCenter'], siteInfo['partnerId'], this.credentials)

        if (permissionGroupsRes.errorCode) {
            throw new Error(JSON.stringify(permissionGroupsRes))
        }

        // Create permissionGroups file
        fs.writeFileSync(path.join(featureDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME), JSON.stringify(permissionGroupsRes['groups'], null, 4))
    }

    reset(directory) {
        this.deleteDirectory(path.join(directory, this.getName()))
    }

    build(directory) {
        const buildFeaturePath = path.join(directory, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, PermissionGroups.PERMISSIONGROUP_FILE_NAME)
    }

    async deploy(partnerDirectory, siteInfo) {
        const buildFeatureDirectory = path.join(partnerDirectory, this.getName())
        const buildFileName = path.join(buildFeatureDirectory, `${this.getName()}.json`)
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        const parsedContent = JSON.parse(fileContent)
        const aclAndScopeData = []
        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }

        for (const key in parsedContent) {
            const keys = parsedContent[key]
            let aclId = keys.aclID
            let scope = keys.scope
            aclAndScopeData.push({ aclId, scope })
        }
        aclAndScopeData.forEach(async ({ aclId, scope }) => {
            const requestBody = {
                aclId: aclId,
                scope: scope,
            }
            const response = await this.deployPermissionGroup(siteInfo, requestBody.aclId, JSON.stringify(requestBody.scope), this.credentials)
            if (response.errorCode === 400006) {
                console.log(`Group ${requestBody.aclId} already exists. Skipping... `)
            }
            if (response.errorCode && response.errorCode !== 400006) {
                throw new Error(JSON.stringify(response))
            }
        })
    }

    async deployPermissionGroup(siteInfo, aclID, scope, credentials) {
        return await this.setPermissionRequest(siteInfo.dataCenter, siteInfo.partnerId, aclID, scope, credentials.userKey, credentials.secret)
    }
    async getPermissionGroups(dataCenter, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getGroups`
        const response = await client.post(url, this.#getPermissionGroupsParameters(partnerID, credentials.userKey, credentials.secret)).catch((error) => error)
        return response.data
    }
    async setPermissionRequest(dataCenter, partnerID, aclID, scope, userKey, secret) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.createGroup`
        const response = await client.post(url, this.#setPermissionGroupsParameters(partnerID, userKey, secret, aclID, scope)).catch((error) => error)
        return response.data
    }

    #setPermissionGroupsParameters(partnerID, userKey, secret, aclID, scope) {
        const parameters = Object.assign({})
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        parameters.groupID = aclID
        parameters.aclID = aclID
        parameters.scope = scope
        return parameters
    }

    #getPermissionGroupsParameters(partnerID, userKey, secret) {
        const parameters = Object.assign({})
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        return parameters
    }
}
