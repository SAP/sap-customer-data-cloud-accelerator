import path from 'path'
import fs from 'fs'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from '../../core/constants.js'
import client from '../../sap-cdc-toolkit/gigya/client.js'
import Feature from '../../core/feature.js'
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
        // The method is empty because there is nothing left to do after PermissionGroups.reset is executed
    }
    async deploy(permissionGroupDirectory, siteInfo) {
        const buildDirectory = path.join(permissionGroupDirectory, this.getName())
        const aclFiles = fs.readdirSync(buildDirectory)
        for (let aclFile of aclFiles) {
            const aclData = fs.readFileSync(path.join(buildDirectory, aclFile), { encoding: 'utf8' })

            if (!aclData || !aclData.length) {
                throw new Error(`Invalid file: ${aclFile}`)
            }
            const parsedData = JSON.parse(aclData)
            const aclName = path.parse(aclFile).name
            let response = await this.setAclRequest(siteInfo.dataCenter, aclName, siteInfo.partnerId, parsedData, this.#credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }
        }
    }

    async setAclRequest(dataCenter, aclID, partnerID, aclContent, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.setACL`
        const response = await client.post(url, this.#setAcl(aclID, partnerID, aclContent, credentials.userKey, credentials.secret))
        return response.data
    }
    async getAclsRequest(dataCenter, aclID, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getACL`
        const response = await client.post(url, this.#getAcls(aclID, partnerID, credentials.userKey, credentials.secret))
        return response.data
    }
    #setAcl(aclID, partnerID, aclContent, userKey, secret) {
        const parameters = Object.assign(this.#getAcls(aclID, partnerID, userKey, secret))
        parameters.acl = JSON.stringify(aclContent)
        return parameters
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
