import fs from 'fs'
import path from 'path'
import Uninstaller from './uninstaller.js'
import { PACKAGE_JSON_FILE_NAME, SAP_ORG } from './constants.js'
import Installer from './installer.js'

export default class ProjectSetup {
    setup() {
        const newProjectPackageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE_NAME, { encoding: 'utf8' }))
        const dependencyName = this.#getAcceleratorDependencyName(newProjectPackageJson.devDependencies)
        const acceleratorInstallationPath = path.join('node_modules', ...dependencyName.split(path.sep))
        const acceleratorPackageJsonPath = path.join(acceleratorInstallationPath, PACKAGE_JSON_FILE_NAME)
        const acceleratorPackageJson = JSON.parse(fs.readFileSync(acceleratorPackageJsonPath, { encoding: 'utf8' }))

        try {
            new Uninstaller().uninstall(newProjectPackageJson, acceleratorPackageJson)
            new Installer().install(newProjectPackageJson, acceleratorInstallationPath, acceleratorPackageJson)
            console.log('Setup completed successfully')
        } catch (err) {
            console.log(err)
        }
    }

    #getAcceleratorDependencyName(devDependencies) {
        const name = Object.keys(devDependencies).filter((dep) => dep.includes(SAP_ORG))
        if (name[0] === undefined) {
            throw new Error(`Cannot find ${SAP_ORG} dependency in ${PACKAGE_JSON_FILE_NAME} file`)
        }
        return name[0]
    }
}
