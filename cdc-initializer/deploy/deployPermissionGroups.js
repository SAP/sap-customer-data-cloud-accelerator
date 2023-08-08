/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const { setPermissionGroupsRequest, getPartnerID } = require('../services/gigya/gigya.helpers');

const deployPermissionGroups = async ({ gigya, apiKey, buildDirectory }) => {
  const filePath = path.join(buildDirectory, 'permissionGroups.json');

  const partnerIDResponse = await getPartnerID(gigya, {
    query: `select partnerID, siteID, baseDomain from sites where apiKey="${apiKey}"`,
    dataCenter:"us1",
  });
  const partnerID = partnerIDResponse.data[0].partnerID;

  if (!partnerID) {
    console.error(`Failed to retrieve partnerID for apiKey "${apiKey}"`);
    throw new Error("PartnerID is not available");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
    const permissionGroups = JSON.parse(fileContents);

    for (const [groupID, permissionGroupValue] of Object.entries(permissionGroups)) {
      if (!permissionGroupValue.aclID || !permissionGroupValue.scope) {
        console.error('aclID or scope is missing in permissionGroups.json for group:', groupID);
        throw new Error('aclID or scope is missing in permissionGroups.json');
      }

      try {
        const result = await setPermissionGroupsRequest(gigya, {  
          dataCenter: "us1", 
          partnerID: partnerID, 
          groupID: groupID, 
          aclID: permissionGroupValue.aclID,
          scope: JSON.stringify(permissionGroupValue.scope), 
        });

        if (result.errorCode && result.errorCode !== 400006) {
          throw new Error(result.errorCode);
        }
      } catch (err) {
        if (err.message === '400006') {
          console.log(`Group ${groupID} already exists. Skipping...`);
        } else {
          console.log('Error creating group:', err.message);
        }
      }
    }
  } else {
    console.error('PermissionGroups file does not exist');
    throw new Error('PermissionGroups file does not exist');
  }
};

module.exports = { deployPermissionGroups };
