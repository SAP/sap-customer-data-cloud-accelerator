import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils.js'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../sap-cdc-toolkit/gigya/client.js'
export default class ACL {
    static ACL_FILE_NAME = 'Acls.json'
    #credentials
    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
    }

    async init(aclID, partnerId, permissionGroupDirectory, dataCenter) {
        let finalResponse = {}
        for (const aclId of aclID) {
            const response = await this.getAclsRequest(dataCenter, aclId, partnerId, this.#credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }

            finalResponse = Object.assign(finalResponse, { [aclId]: response['acl'] })
        }

        fs.writeFileSync(path.join(permissionGroupDirectory, ACL.ACL_FILE_NAME), JSON.stringify(finalResponse, null, 4))
    }

    build(directory) {
        const buildFeaturePath = path.join(directory, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, ACL.ACL_FILE_NAME)
    }

    async deploy(partnerDirectory, siteInfo) {
        console.log('deploy was called')
    }
    async getAclsRequest(dataCenter, aclID, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getACL`
        const response = await client.post(url, this.#getAcls(aclID, partnerID, credentials.userKey, credentials.secret))
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
