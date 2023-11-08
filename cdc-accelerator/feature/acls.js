import PartnerFeature from './partnerFeature.js'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../../cdc-accelerator/sap-cdc-toolkit/gigya/client.js'
export default class ACL extends PartnerFeature {
    static ACL_FILE_NAME = 'Acls.json'
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(permissionGroupsFile, partnerId, partnerDirectory, dataCenter) {
        const permissionGroups = JSON.parse(permissionGroupsFile)
        const aclData = []
        let finalResponse = {}
        if (!permissionGroups) {
            console.error('Failed to parse groups from permissionGroups.json file')
            return
        }
        const featureDirectory = path.join(partnerDirectory, this.getName())
        this.createDirectory(featureDirectory)
        for (const key in permissionGroups) {
            const keys = permissionGroups[key]
            let aclId = keys.aclID
            aclData.push({ aclId })
        }
        for (const { aclId } of aclData) {
            const response = await this.getAclsRequest(dataCenter, aclId, partnerId, this.credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }
            finalResponse = Object.assign(finalResponse, { [aclId]: response['acl'] })
        }
        fs.writeFileSync(path.join(featureDirectory, ACL.ACL_FILE_NAME), JSON.stringify(finalResponse, null, 4))
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
        console.log('deploy was called')
    }
    async getAclsRequest(dataCenter, requestBody, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getACL`
        const response = await client.post(url, this.#getAcls(requestBody, partnerID, credentials.userKey, credentials.secret))
        return response.data
    }
    #getAcls(aclID, partnerID, userKey, secret) {
        const parameters = Object.assign({})
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        parameters.aclID = aclID
        return parameters
    }
}
//TOOLKIT CHANNELS E TOPICS ou CONSENTS MESMA MANEIRA COM OS ACLS
