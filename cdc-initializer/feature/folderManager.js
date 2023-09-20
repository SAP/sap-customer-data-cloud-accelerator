import SitesCache from './sitesCache.js'
import path from 'path'

export default class FolderManager {
    static SRC_DIRECTORY = 'src/'
    static BUILD_DIRECTORY = 'build/'
    static SITES_DIRECTORY = 'Sites/'
    sitesCache

    constructor(credentials) {
        this.sitesCache = new SitesCache(credentials)
    }

    static getBaseFolder(operation) {
        let baseFolder
        switch (operation) {
            case 'init':
            case 'reset':
                baseFolder = FolderManager.SRC_DIRECTORY
                break
            case 'build':
            case 'deploy':
                baseFolder = FolderManager.BUILD_DIRECTORY
                break
            default:
                baseFolder = ''
                break
        }
        return baseFolder
    }

    async getPartnerFolder(operation, apiKey) {
        const info = await this.getSiteInfo(apiKey)
        const baseFolder = FolderManager.getBaseFolder(operation)
        return path.join(baseFolder, info.partnerName)
    }

    async getSiteBaseFolder(operation, apiKey) {
        return path.join(await this.getPartnerFolder(operation, apiKey), FolderManager.SITES_DIRECTORY)
    }

    async getSiteFolder(operation, apiKey) {
        const info = await this.getSiteInfo(apiKey)
        const baseFolder = FolderManager.getBaseFolder(operation)
        return path.join(baseFolder, info.partnerName, FolderManager.SITES_DIRECTORY, info.baseDomain)
    }

    async getSiteInfo(apiKey) {
        return this.sitesCache.getSiteInfo(apiKey)
    }
}
