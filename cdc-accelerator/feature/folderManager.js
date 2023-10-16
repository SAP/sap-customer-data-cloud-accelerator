import SitesCache from './sitesCache.js'
import path from 'path'
import { SRC_DIRECTORY, BUILD_DIRECTORY, SITES_DIRECTORY, Operations } from './constants.js'

export default class FolderManager {
    static getBaseFolder(operation) {
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

    static getPartnerFolder(operation, apiKey) {
        const info = SitesCache.getSiteInfo(apiKey)
        const baseFolder = FolderManager.getBaseFolder(operation)
        return path.join(baseFolder, info.partnerName)
    }

    static getSiteBaseFolder(operation, apiKey) {
        return path.join(FolderManager.getPartnerFolder(operation, apiKey), SITES_DIRECTORY)
    }

    static getSiteFolder(operation, apiKey) {
        const info = SitesCache.getSiteInfo(apiKey)
        const baseFolder = FolderManager.getBaseFolder(operation)
        return path.join(baseFolder, info.partnerName, SITES_DIRECTORY, info.baseDomain)
    }

    static getSiteInfo(apiKey) {
        return SitesCache.getSiteInfo(apiKey)
    }
}
