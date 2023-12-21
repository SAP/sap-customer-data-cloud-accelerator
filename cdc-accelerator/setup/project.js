import fs from 'fs'
import path from 'path'
import Uninstaller from './uninstaller.js'
import { SAP_ORG } from './constants.js'
import Installer from './installer.js'
import { PACKAGE_JSON_FILE_NAME } from '../core/constants.js'

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
}
