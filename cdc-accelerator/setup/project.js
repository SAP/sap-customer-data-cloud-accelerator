import fs from 'fs'
import path from 'path'
import Uninstaller from './uninstaller.js'
import { PREVIEW_DIRECTORY, SAP_ORG } from './constants.js'
import Installer from './installer.js'
import { CDC_ACCELERATOR_DIRECTORY, PACKAGE_JSON_FILE_NAME, PREVIEW_FILE_NAME, SRC_DIRECTORY, TEMPLATES_DIRECTORY } from '../core/constants.js'

export default class Project {
    setup() {
        try {
            const newProjectPackageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE_NAME, { encoding: 'utf8' }))
            const dependencyName = Project.getAcceleratorDependencyName(newProjectPackageJson.devDependencies)
            const acceleratorInstallationPath = path.join('node_modules', ...dependencyName.split(path.sep))
            const acceleratorPackageJsonPath = path.join(acceleratorInstallationPath, PACKAGE_JSON_FILE_NAME)
            const acceleratorPackageJson = JSON.parse(fs.readFileSync(acceleratorPackageJsonPath, { encoding: 'utf8' }))

            new Uninstaller().uninstall(newProjectPackageJson, acceleratorPackageJson)
            new Installer().install(newProjectPackageJson, acceleratorInstallationPath, acceleratorPackageJson)
            console.log('Setup completed successfully')
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    static getAcceleratorDependencyName(devDependencies) {
        const name = Object.keys(devDependencies).filter((dep) => dep.includes(SAP_ORG))
        if (name[0] === undefined) {
            throw new Error(`Cannot find ${SAP_ORG} dependency in ${PACKAGE_JSON_FILE_NAME} file`)
        }
        return name[0]
    }

    static copyPreviewTemplateIfNotExists() {
        const newProjectPackageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE_NAME, { encoding: 'utf8' }))
        try {
            const dependencyName = Project.getAcceleratorDependencyName(newProjectPackageJson.devDependencies)
            new Installer().generatePreviewFile(path.join('node_modules', ...dependencyName.split(path.sep)))
        } catch (error) {
            fs.copyFileSync(path.join(CDC_ACCELERATOR_DIRECTORY, TEMPLATES_DIRECTORY, PREVIEW_DIRECTORY, PREVIEW_FILE_NAME), path.join(SRC_DIRECTORY, PREVIEW_FILE_NAME))
        }
    }
}
