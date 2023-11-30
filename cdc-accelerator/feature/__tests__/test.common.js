import path from 'path'
import { SRC_DIRECTORY, BUILD_DIRECTORY, SITES_DIRECTORY, Operations } from '../../core/constants.js'
import SiteFeature from '../siteFeature.js'
import Schema from '../site/schema.js'
import WebSdk from '../site/webSdk.js'
import Policies from '../site/policies.js'
import PartnerFeature from '../partnerFeature.js'
import PermissionGroups from '../partner/permissionGroups.js'

export const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
export const siteDomain = 'domain.test.com'
export const apiKey = 'apiKey'
export const partnerIds = ['partnerId1', 'partnerId2']
export const partnerBaseDirectory = path.join(SRC_DIRECTORY, partnerIds[0])
export const siteBaseDirectory = path.join(SRC_DIRECTORY, partnerIds[0], SITES_DIRECTORY)
export const srcSiteDirectory = path.join(siteBaseDirectory, siteDomain)
export const buildSiteDirectory = srcSiteDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
export const partnerBuildDirectory = partnerBaseDirectory.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
export const sites = [
    {
        apiKey: '1_Eh-x_qKjjBJ_-QBEfMDABC',
        baseDomain: 'cdc-accelerator.parent.site-group.com',
        dataCenter: 'eu1',
        partnerId: 79597568,
        partnerName: partnerIds[0],
    },
    {
        apiKey: '2_Eh-x_qKjjBJ_-QBEfMDABC',
        baseDomain: 'cdc-accelerator.preferences-center.com',
        dataCenter: 'eu1',
        partnerId: 79597569,
        partnerName: partnerIds[1],
    },
]
export const config = {
    source: [
        {
            apiKey: sites[0].apiKey,
            features: ['feature1'],
        },
        {
            apiKey: sites[1].apiKey,
        },
    ],
    deploy: { apiKey: sites[1].apiKey },
}

export function getSiteFeature() {
    const siteFeature = new SiteFeature(credentials)
    siteFeature.register(new Schema(credentials))
    siteFeature.register(new WebSdk(credentials))
    siteFeature.register(new Policies(credentials))
    return siteFeature
}

export function getPartnerFeature() {
    const partnerFeature = new PartnerFeature(credentials)
    partnerFeature.register(new PermissionGroups(credentials))
    return partnerFeature
}

export function spyAllFeaturesMethod(featuresType, method) {
    const spies = []
    for (const f of featuresType.getFeatures()) {
        spies.push(jest.spyOn(f, method).mockImplementation(() => {}))
    }
    return spies
}

export function getBaseFolder(operation) {
    let baseFolder
    switch (operation) {
        case Operations.init:
        case Operations.reset:
            baseFolder = SRC_DIRECTORY
            break
        case Operations.build:
        case Operations.deploy:
            baseFolder = BUILD_DIRECTORY
            break
        default:
            baseFolder = ''
            break
    }
    return baseFolder
}
