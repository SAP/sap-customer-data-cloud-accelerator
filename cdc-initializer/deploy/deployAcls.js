/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const { setAclRequest, getPartnerIdRequest } = require('../services/gigya/gigya.helpers');

const deployAcls = async ({ gigya, apiKey, buildDirectory }) => {
  const aclFiles = fs.readdirSync(buildDirectory);

  const query = `select partnerID, siteID, baseDomain from sites where apiKey="${apiKey}"`;
  const partnerIDResponse = await getPartnerIdRequest(gigya, { query });

  // Error checking based on your version of getPartnerIdRequest
  if (!partnerIDResponse || !partnerIDResponse.data || !partnerIDResponse.data[0] || !partnerIDResponse.data[0].partnerID) {
    console.error(`Failed to retrieve partnerID for apiKey "${apiKey}"`);
    throw new Error("Failed to retrieve partnerID or it's not available in the response");
  }
  
  
  const partnerID = partnerIDResponse.data[0].partnerID;

  for (const file of aclFiles) {
    const filePath = path.join(buildDirectory, file);
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
    const aclID = path.basename(file, '.json');

    const result = setAclRequest(gigya, {
      apiKey,
      dataCenter: "us1",
      aclID: aclID,
      acl: fileContents,
      partnerID: partnerID,
    });

    if (result.errorCode) {
      throw new Error(result.errorCode);
    }
  }
};

module.exports = { deployAcls };
