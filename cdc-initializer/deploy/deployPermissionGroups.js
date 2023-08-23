/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
import fs from 'fs'
import path from 'path'

import { setPermissionRequest } from '../services/gigya/gigya.helpers.js'
import { getPartnerId } from '../utils/utils.js'

const deployPermissionGroups = async ({ gigya, apiKey, dataCenter, buildDirectory }) => {
    const filePath = path.join(buildDirectory, 'permissionGroups.json')

    if (fs.statSync(filePath).isFile()) {
        const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' })

        const permissionGroupValue = JSON.parse(fileContents)
        const groupID = permissionGroupValue.aclID
        const aclID = permissionGroupValue.aclID
        const scope = JSON.stringify(permissionGroupValue.scope)

        const result = setPermissionRequest(gigya, { apiKey, dataCenter, groupID: groupID, scope: scope, partnerID: '79597568', aclID: aclID })
        if (result.errorCode) {
            throw new Error(result.errorCode)
        }
    }
}

export { deployPermissionGroups }
