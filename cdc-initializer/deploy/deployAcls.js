import fs from 'fs'
import path from 'path'

import { setAclRequest } from '../services/gigya/gigya.helpers.js'

const deployAcls = async ({ gigya, apiKey, dataCenter, buildDirectory }) => {
    const aclFiles = fs.readdirSync(buildDirectory)

    for (const file of aclFiles) {
        const filePath = path.join(buildDirectory, file)
        const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' })

        const aclValue = JSON.parse(fileContents)
        const aclID = path.basename(file, '.json')

        const result = setAclRequest(gigya, { apiKey, dataCenter, aclID: aclID, acl: JSON.stringify(aclValue), partnerID: '79597568' })

        if (result.errorCode) {
            throw new Error(result.errorCode)
        }
    }
}

export { deployAcls }
