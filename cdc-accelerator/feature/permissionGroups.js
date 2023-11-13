import PartnerFeature from './partnerFeature.js'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../../cdc-accelerator/sap-cdc-toolkit/gigya/client.js'
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
        fs.writeFileSync(path.join(featureDirectory, PermissionGroups.PERMISSIONGROUP_FILE_NAME), JSON.stringify(permissionGroupsRes['groups'], null, 4))
        const aclIDs = Object.keys(permissionGroupsRes['groups']).map((key) => permissionGroupsRes['groups'][key].aclID)
        await this.#acls.init(aclIDs, siteInfo['partnerId'], featureDirectory, siteInfo['dataCenter'])
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

        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }

        let keys = Object.keys(parsedContent)
        const aclAndScopeData = keys.map((key) => {
            const { aclID, scope } = parsedContent[key]
            return { aclId: aclID, scope, groupId: key }
        })
        for (let keys of aclAndScopeData) {
            const response = await this.deployPermissionGroup(siteInfo, keys.groupId, keys.aclId, keys.scope, this.credentials)
            if (response.errorCode === 400006) {
                console.log(`Group ${keys.groupId} already exists. Skipping...`)
            }
            if (response.errorCode !== 0 && response.errorCode !== 400006) {
                throw new Error(JSON.stringify(response))
            }
        }
    }

    async deployPermissionGroup(siteInfo, groupId, aclId, scope, credentials) {
        return await this.setPermissionRequest(siteInfo.dataCenter, siteInfo.partnerId, groupId, aclId, scope, credentials.userKey, credentials.secret)
    }
    async getPermissionGroups(dataCenter, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getGroups`
        const response = await client.post(url, this.#getPermissionGroupsParameters(partnerID, credentials.userKey, credentials.secret)).catch((error) => error)
        return response.data
    }
    async setPermissionRequest(dataCenter, partnerID, groupID, aclID, scope, userKey, secret) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.createGroup`
        const response = await client.post(url, this.#setPermissionGroupsParameters(partnerID, userKey, secret, groupID, aclID, JSON.stringify(scope))).catch((error) => error)
        return response.data
    }

    #setPermissionGroupsParameters(partnerID, userKey, secret, groupID, aclID, scope) {
        const parameters = Object.assign(this.#getPermissionGroupsParameters(partnerID, userKey, secret))
        parameters.groupID = groupID
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
    getAcl() {
        return this.#acls
    }
}
