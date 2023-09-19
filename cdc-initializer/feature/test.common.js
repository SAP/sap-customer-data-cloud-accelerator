import path from 'path'
import FolderManager from './folderManager'
import SiteFeature from './siteFeature'
import Schema from './schema'
import WebSdk from './webSdk'
import Policies from './policies'
import PartnerFeature from './partnerFeature'
import PermissionGroups from './permissionGroups'

export const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
export const siteDomain = 'domain.test.com'
export const apiKey = 'apiKey'
export const partnerIds = ['partnerId1', 'partnerId2']
export const siteBaseDirectory = path.join(FolderManager.SRC_DIRECTORY, partnerIds[0], FolderManager.SITES_DIRECTORY)
export const srcSiteDirectory = path.join(siteBaseDirectory, siteDomain)
export const buildSiteDirectory = srcSiteDirectory.replace(FolderManager.SRC_DIRECTORY, FolderManager.BUILD_DIRECTORY)
export const sites = [
    { apiKey: '1_Eh-x_qKjjBJ_-QBEfMDABC', siteDomain: 'cdc-accelerator.parent.site-group.com' },
    { apiKey: '2_Eh-x_qKjjBJ_-QBEfMDABC', siteDomain: 'cdc-accelerator.preferences-center.com' },
]

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
