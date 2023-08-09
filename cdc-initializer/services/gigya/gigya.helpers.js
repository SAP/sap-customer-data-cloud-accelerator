/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-initializer contributors
 * License: Apache-2.0
 */
const getSiteConfigRequest = async (gigya, { apiKey, ...props }) => {
    const url = `https://accounts.us1.gigya.com/admin.getSiteConfig`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setSiteConfigRequest = async (gigya, { apiKey, ...props }) => {
    const url = `https://accounts.us1.gigya.com/admin.setSiteConfig`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const getScreenSetsRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.getScreenSets`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setScreenSetsRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.setScreenSet`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setEmailTemplatesRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.policies.emailTemplates.setConfig`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setPoliciesRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.setPolicies`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setConsentsStatementsRequest  = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.setConsentsStatements`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setLegalStatementsRequest  = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.setLegalStatements`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const getPoliciesRequest  = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/accounts.getPolicies`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setAclRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/admin.setACL`
    const response = await gigya.request(url, { apiKey, ...props }).catch((error) => error)
    return response.data
}

const setPermissionGroupsRequest = async (gigya, { apiKey, dataCenter, ...props }) => {
    const url = `https://accounts.${dataCenter}.gigya.com/admin.createGroup`
    const response = await gigya.request(url, { apiKey, ...props}).catch((error) => error)
    return response.data
}

const getPartnerIdRequest  = async (gigya, {...props }) => {
    const url = `https://accounts.gigya.com/admin.search`
    const response = await gigya.request(url, { ...props }).catch((error) => error)
    return response.data
}

module.exports = {
    getSiteConfigRequest,
    setSiteConfigRequest,
    getScreenSetsRequest,
    setScreenSetsRequest,
    setEmailTemplatesRequest,
    setPoliciesRequest,
    setConsentsStatementsRequest,
    setLegalStatementsRequest,
    getPoliciesRequest,
    setAclRequest,
    setPermissionGroupsRequest,
    getPartnerIdRequest,
}
