import path from 'path'
import fs from 'fs'
import { SRC_DIRECTORY, BUILD_DIRECTORY } from './constants.js'
import client from '../sap-cdc-toolkit/gigya/client.js'
export default class ACL {
    static ACL_FILE_NAME = 'Acl.json'
    #credentials
    constructor(credentials) {
        this.#credentials = credentials
    }

    getName() {
        return this.constructor.name
    }

    async init(aclIDList, partnerId, permissionGroupDirectory, dataCenter) {
        let finalResponse = {}
        for (const aclId of aclIDList) {
            const response = await this.getAclsRequest(dataCenter, aclId, partnerId, this.#credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }
            finalResponse[aclId] = {
                acl: response['acl'],
                description: response['description'],
            }
        }

        fs.writeFileSync(path.join(permissionGroupDirectory, ACL.ACL_FILE_NAME), JSON.stringify(finalResponse, null, 4))
    }
    build(directory) {
        const srcFeaturePath = directory.replace(BUILD_DIRECTORY, SRC_DIRECTORY)
        const fileContent = JSON.parse(fs.readFileSync(path.join(srcFeaturePath, ACL.ACL_FILE_NAME), { encoding: 'utf8' }))
        fs.writeFileSync(path.join(directory, ACL.ACL_FILE_NAME), JSON.stringify(fileContent, null, 4))
    }
    reset() {
        //This is supposed to be empty
    }
    async deploy(partnerDirectory, siteInfo) {
        const buildFileName = path.join(partnerDirectory, `${this.getName()}.json`)
        const fileContent = fs.readFileSync(buildFileName, { encoding: 'utf8' })
        if (!fileContent || !fileContent.length) {
            throw new Error(`Invalid file: ${buildFileName}`)
        }
        const parsedContent = JSON.parse(fileContent)
        let keys = Object.keys(parsedContent)
        for (let ids of keys) {
            if (ids.startsWith('_')) {
                console.log('entered here', ids)
                continue
            }
            let response = await this.deployAclRequest(siteInfo.dataCenter, ids, siteInfo.partnerId, parsedContent[ids].acl, parsedContent[ids].description, this.#credentials)
            if (response.errorCode) {
                throw new Error(JSON.stringify(response))
            }
        }
        console.log('deploy was called')
    }
    async deployAclRequest(dataCenter, aclID, partnerID, aclContent, description, credentials) {
        return await this.setAclRequest(dataCenter, aclID, partnerID, aclContent, description, credentials)
    }
    async setAclRequest(dataCenter, aclID, partnerID, aclContent, description, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.setACL`
        const response = await client.post(url, this.#setAcl(aclID, partnerID, aclContent, description, credentials.userKey, credentials.secret))
        return response.data
    }
    async getAclsRequest(dataCenter, aclID, partnerID, credentials) {
        const url = `https://admin.${dataCenter}.gigya.com/admin.getACL`
        const response = await client.post(url, this.#getAcls(aclID, partnerID, credentials.userKey, credentials.secret))
        return response.data
    }
    #setAcl(aclID, partnerID, aclContent, description, userKey, secret) {
        const parameters = Object.assign({})
        parameters.userKey = userKey
        parameters.secret = secret
        parameters.partnerID = partnerID
        parameters.aclID = aclID
        parameters.acl = JSON.stringify(aclContent)
        if (description) {
            parameters.description = description
        }
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
