import path from 'path'
import FolderManager from './folderManager'
import SiteFeature from './siteFeature'
import Schema from './schema'
import WebSdk from './webSdk'
import Policies from './policies'

export const credentials = {
    userKey: 'userKey',
    secret: 'secret',
}
export const siteDomain = 'domain.test.com'
export const apiKey = 'apiKey'
export const partnerId = 'partnerId'
export const siteBaseDirectory = path.join(FolderManager.SRC_DIRECTORY, partnerId, FolderManager.SITES_DIRECTORY)
export const siteDirectory = path.join(siteBaseDirectory, siteDomain)
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
