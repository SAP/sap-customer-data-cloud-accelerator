/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const fs = require('fs');
const path = require('path')

const { setPermissionRequest } = require('../services/gigya/gigya.helpers')
const {getPartnerId} = require('../utils/utils')
const deployPermissionGroups = async ({ gigya, apiKey, dataCenter, buildDirectory }) => {
  const filePath = path.join(buildDirectory, 'permissionGroups.json')

  if (fs.statSync(filePath).isFile()) {
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' })

    const permissionGroupValue = JSON.parse(fileContents)
    const groupID = permissionGroupValue.aclID
    const aclID = permissionGroupValue.aclID
    const scope = JSON.stringify(permissionGroupValue.scope)

  // Get the partnerID from the apiKey
//   const partnerIDResponse = await getPartnerID(gigya, {
//     query: `select partnerID, siteID, baseDomain from sites where apiKey="${apiKey}"`,
// });


//     if (!partnerIDResponse || partnerIDResponse.errorCode) {
//         console.error(`Failed to retrieve partnerID for apiKey "${apiKey}"`);
//         throw new Error(JSON.stringify(partnerIDResponse));
//     }

    // const partnerID = JSON.stringify(partnerIDResponse.data[0].partnerID);

    const result = setPermissionRequest(gigya, { apiKey, dataCenter, groupID: groupID, scope: scope, partnerID: "79597568", aclID: aclID })
    if (result.errorCode) {
      throw new Error(result.errorCode)
    }
  }
}

module.exports = { deployPermissionGroups }
