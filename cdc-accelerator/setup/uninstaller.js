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
            if (
                !this.#containsForbiddenCharacters(entry[0]) &&
                !entry[0].includes(CDC_ACCELERATOR_DIRECTORY) &&
                this.#containsDependency(entry[0], dependenciesProperty, newProjectPackageJson)
            ) {
                execSync(`npm remove ${entry[0]}`, { stdio: 'inherit' })
            }
        })
        this.#uninstallDependency('light-server', newProjectPackageJson)
    }

    #containsForbiddenCharacters(dependency) {
        const forbidden = dependency.match(/[*?:;,&|+]/)
        return forbidden ? true : false
    }

    #containsDependency(dependency, dependenciesContainer, newProjectPackageJson) {
        return Object.keys(newProjectPackageJson[dependenciesContainer]).includes(dependency)
    }

    #uninstallDependency(dependency, newProjectPackageJson) {
        if (newProjectPackageJson.dependencies && newProjectPackageJson.dependencies[dependency]) {
            execSync(`npm remove ${dependency}`, { stdio: 'inherit' })
        }
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
