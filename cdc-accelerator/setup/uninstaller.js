import fs from 'fs'
import { CDC_ACCELERATOR_DIRECTORY } from '../core/constants.js'
import { CONFIGURATION_FILES } from './constants.js'
import Terminal from '../core/terminal.js'

export default class Uninstaller {
    uninstall(newProjectPackageJson, acceleratorPackageJson) {
        this.#uninstallAcceleratorDependencies(newProjectPackageJson, acceleratorPackageJson)
        this.#deleteConfigurationFiles()
    }

    #uninstallAcceleratorDependencies(newProjectPackageJson, acceleratorPackageJson) {
        const dependenciesProperty = 'devDependencies'
        Object.entries(acceleratorPackageJson[dependenciesProperty]).forEach((entry) => {
            if (!entry[0].includes(CDC_ACCELERATOR_DIRECTORY) && this.#containsDependency(entry[0], dependenciesProperty, newProjectPackageJson)) {
                this.#uninstallDependency(entry[0])
            }
        })
        if (this.#containsDependency('light-server', 'dependencies', newProjectPackageJson)) {
            this.#uninstallDependency('light-server', newProjectPackageJson)
        }
    }

    #containsDependency(dependency, dependenciesContainer, newProjectPackageJson) {
        return newProjectPackageJson[dependenciesContainer] !== undefined && Object.keys(newProjectPackageJson[dependenciesContainer]).includes(dependency)
    }

    #uninstallDependency(dependency) {
        return Terminal.executeCommand(`npm remove ${dependency}`)
    }

    #deleteConfigurationFiles() {
        CONFIGURATION_FILES.forEach((file) => {
            if (fs.existsSync(file)) {
                fs.unlink(file, function (err) {
                    if (err) {
                        throw err
                    }
                })
            }
        })
    }
}
