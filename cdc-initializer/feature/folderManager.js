import SitesCache from './sitesCache.js'
import path from 'path'
import { SRC_DIRECTORY, BUILD_DIRECTORY, SITES_DIRECTORY } from './constants.js'

export default class FolderManager {
    sitesCache

    constructor(credentials) {
        this.sitesCache = new SitesCache(credentials)
        console.log('Current directory2: ' + process.cwd());
    }

    static getBaseFolder(operation) {
        let baseFolder
        switch (operation) {
            case 'init':
            case 'reset':
                baseFolder = SRC_DIRECTORY
                break
            case 'build':
            case 'deploy':
                baseFolder = BUILD_DIRECTORY
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
        return path.join(await this.getPartnerFolder(operation, apiKey), SITES_DIRECTORY)
    }

    async getSiteFolder(operation, apiKey) {
        const info = await this.getSiteInfo(apiKey)
        const baseFolder = FolderManager.getBaseFolder(operation)
        return path.join(baseFolder, info.partnerName, SITES_DIRECTORY, info.baseDomain)
    }

    async getSiteInfo(apiKey) {
        return this.sitesCache.getSiteInfo(apiKey)
    }
}
