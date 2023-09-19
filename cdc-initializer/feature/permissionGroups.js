import PartnerFeature from './partnerFeature'
import path from 'path'
import fs from 'fs'
import { clearDirectoryContents } from '../utils/utils'
import FolderManager from './folderManager'

export default class PermissionGroups extends PartnerFeature {
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(directory) {
        const featureDirectory = path.join(directory, this.getName())
        this.createDirectory(featureDirectory)
        // Create file
        fs.writeFileSync(path.join(featureDirectory, 'permissionGroups.json'), JSON.stringify({ key: 'dummy' }, null, 4))
    }

    reset(directory) {
        this.deleteDirectory(path.join(directory, this.getName()))
    }

    build(directory) {
        const buildFeaturePath = path.join(directory, this.getName())
        clearDirectoryContents(buildFeaturePath)
        const srcFeaturePath = buildFeaturePath.replace(FolderManager.BUILD_DIRECTORY, FolderManager.SRC_DIRECTORY)
        this.copyFileFromSrcToBuild(srcFeaturePath, 'permissionGroups.json')
    }

    async deploy(directory) {}
}
