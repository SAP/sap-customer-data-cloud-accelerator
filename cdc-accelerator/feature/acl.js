import path from 'path'
import fs from 'fs'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../sap-cdc-toolkit/gigya/client.js'
import Feature from './feature.js'
export default class ACL extends Feature {
    #credentials
    constructor(credentials) {
        super(credentials)
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
    }

    async init(aclIDList, partnerId, permissionGroupDirectory, dataCenter) {
        const featureDirectory = path.join(permissionGroupDirectory, this.getName())
        this.createDirectory(featureDirectory)
        for (const aclId of aclIDList) {
            const response = await this.getAclsRequest(dataCenter, aclId, partnerId, this.#credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }

            if (!aclId.startsWith('_')) {
                fs.writeFileSync(path.join(featureDirectory, `${aclId}.json`), JSON.stringify(response['acl'], null, 4))
            }
        }
    }
    build(directory) {
        const srcFeaturePath = directory.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        const srcAclPath = path.join(srcFeaturePath, this.getName())
        const buildPath = path.join(directory, this.getName())
        this.createDirectoryIfNotExists(buildPath)
        fs.readdirSync(srcAclPath).forEach((aclFile) => {
            const aclData = fs.readFileSync(path.join(srcAclPath, aclFile), { encoding: 'utf8' })
            fs.writeFileSync(path.join(buildPath, aclFile), aclData)
        })
    }
    reset() {
        //This is supposed to be empty
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
