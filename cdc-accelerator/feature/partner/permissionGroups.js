import PartnerFeature from '../partnerFeature.js'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../core/constants.js'
import client from '../../sap-cdc-toolkit/gigya/client.js'
import ACL from './acl.js'
export default class PermissionGroups extends PartnerFeature {
    static PERMISSIONGROUP_FILE_NAME = 'PermissionGroups.json'
    #acls

    constructor(credentials) {
        super(credentials)
        this.#acls = new ACL(this.credentials)
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
        const permissionGroupsRes = await this.getPermissionGroups(siteInfo['dataCenter'], siteInfo['partnerId'], this.credentials)
        if (permissionGroupsRes.errorCode) {
            throw new Error(JSON.stringify(permissionGroupsRes))
        }
        fs.writeFileSync(
            path.join(featureDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME),
            JSON.stringify(this.remove_built_in_permission_groups(permissionGroupsRes.groups), null, 4),
        )
        const aclIDs = Object.keys(permissionGroupsRes['groups']).map((key) => permissionGroupsRes['groups'][key].aclID)
        await this.#acls.init(aclIDs, siteInfo['partnerId'], featureDirectory, siteInfo['dataCenter'])
    }

    reset(directory) {
        this.deleteDirectory(path.join(directory, this.getName()))
        this.#acls.reset()
    }
    build(directory) {
        const buildFeaturePath = path.join(directory, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, PermissionGroups.PERMISSIONGROUP_FILE_NAME)
        this.#acls.build(buildFeaturePath)
    }

    async deploy(partnerDirectory, siteInfo) {
        const buildFeatureDirectory = path.join(partnerDirectory, this.getName())
        const buildFileName = path.join(buildFeatureDirectory, `${this.getName()}.json`)
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })

        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }
        const parsedContent = JSON.parse(fileContent)

        let keys = Object.keys(parsedContent)
        let response
        for (let ids of keys) {
            if (parsedContent[ids].scope) {
                response = await this.deployPermissionGroup(siteInfo, ids, parsedContent[ids], this.credentials)
            }
            response = await this.updatePermissionGroup(siteInfo, ids, parsedContent[ids], this.credentials)
            if (response.errorCode !== 0) {
                throw new Error(JSON.stringify(response))
            }
        }
        this.#acls.deploy(buildFeatureDirectory, siteInfo)
    }

    async deployPermissionGroup(siteInfo, groupId, config, credentials) {
        return await this.setPermissionRequest(siteInfo.dataCenter, siteInfo.partnerId, groupId, config, credentials.userKey, credentials.secret)
    }
    async updatePermissionGroup(siteInfo, groupID, config, credentials) {
        return await this.updatePermissionGroupRequest(siteInfo.dataCenter, siteInfo.partnerId, groupID, config, credentials)
    }
    async getPermissionGroups(dataCenter, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getGroups`
        const response = await client.post(url, this.#getPermissionGroupsParameters(partnerID, credentials.userKey, credentials.secret))
        return response.data
    }
    async setPermissionRequest(dataCenter, partnerID, groupId, config, userKey, secret) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.createGroup`
        const response = await client.post(url, this.#updatePermissionGroupsParameters(partnerID, groupId, config, userKey, secret))
        return response.data
    }

    async updatePermissionGroupRequest(dataCenter, partnerID, groupID, config, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.updateGroup`
        const response = await client.post(url, this.#updatePermissionGroupsParameters(partnerID, groupID, config, credentials.userKey, credentials.secret))
        return response.data
    }

    #updatePermissionGroupsParameters(partnerID, groupID, config, userKey, secret) {
        const parameters = Object.assign(this.#getPermissionGroupsParameters(partnerID, userKey, secret))
        parameters.groupID = groupID
        if (config.aclID) {
            parameters.aclID = config.aclID
        }
        if (config.scope) {
            parameters.scope = JSON.stringify(config.scope)
        }
        if (config.description) {
            parameters.description = config.description
        }
        if (config.users) {
            parameters.setUsers = JSON.stringify(config.users)
        }
        return parameters
    }

    #getPermissionGroupsParameters(partnerID, userKey, secret) {
        const parameters = Object.assign({})
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        return parameters
    }
    getAcl() {
        return this.#acls
    }

    remove_built_in_permission_groups(content) {
        const filteredGroups = {}
        for (const [key, value] of Object.entries(content)) {
            if (key && !key.startsWith('_')) {
                filteredGroups[key] = {
                    aclID: value.aclID,
                    description: value.description,
                }
            }
        }
        return filteredGroups
    }
}
