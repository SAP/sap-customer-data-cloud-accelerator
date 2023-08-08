/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const { setAclRequest, getPartnerID } = require('../services/gigya/gigya.helpers');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deployAcls = async ({ gigya, apiKey, buildDirectory }) => {
  const aclFiles = fs.readdirSync(buildDirectory);
  const dataCenter = "us1";

  const partnerIDResponse = await getPartnerID(gigya, {
    query: `select partnerID, siteID, baseDomain from sites where apiKey="${apiKey}"`,
    dataCenter,
  });
  
  const partnerID = partnerIDResponse.data[0].partnerID;

  if (!partnerID) {
    console.error(`Failed to retrieve partnerID for apiKey "${apiKey}"`);
    throw new Error("PartnerID is not available");
  }

  for (const file of aclFiles) {
    const filePath = path.join(buildDirectory, file);
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });

    const aclValue = JSON.parse(fileContents);
    const aclID = path.basename(file, '.json');

    await delay(100); 

    const result = setAclRequest(gigya, {
      apiKey,
      dataCenter,
      aclID: aclID,
      acl: JSON.stringify(aclValue),
      partnerID: partnerID,
    });

    if (result.errorCode) {
      throw new Error(result.errorCode);
    }
  }
};

module.exports = { deployAcls };
