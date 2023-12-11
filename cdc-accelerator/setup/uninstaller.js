import fs from 'fs'
import { execSync } from 'child_process'
import { CDC_ACCELERATOR_DIRECTORY } from '../core/constants.js'
import { CONFIGURATION_FILES } from './constants.js'

export default class Uninstaller {
    uninstall(newProjectPackageJson, acceleratorPackageJson) {
        this.#uninstallAcceleratorDependencies(newProjectPackageJson, acceleratorPackageJson)
        this.#deleteConfigurationFiles()
    }

    #uninstallAcceleratorDependencies(newProjectPackageJson, acceleratorPackageJson) {
        const dependenciesProperty = 'devDependencies'
        Object.entries(acceleratorPackageJson[dependenciesProperty]).forEach((entry) => {
            if (!entry[0].includes(CDC_ACCELERATOR_DIRECTORY) && this.#containsDependency(entry[0], dependenciesProperty, newProjectPackageJson)) {
                execSync(`npm remove ${entry[0]}`, { stdio: 'inherit' })
            }
        })
    }

    #containsDependency(dependency, dependenciesContainer, newProjectPackageJson) {
        return Object.entries(newProjectPackageJson[dependenciesContainer]).includes((entry) => entry === dependency)
    }

    #deleteConfigurationFiles() {
        CONFIGURATION_FILES.forEach((file) => {
            fs.unlink(file, function (err) {
                if (err) {
                    throw err
                }
            })
        })
    }
}
