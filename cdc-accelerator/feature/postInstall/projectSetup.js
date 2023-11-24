import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default class ProjectSetup {
    static SAP_ORG = '@sap_oss'
    static PACKAGE_JSON_FILE_NAME = 'package.json'

    #generateNpmScripts(newProjectPackageJson) {
        return Object.assign(
            newProjectPackageJson['scripts'],
            this.#generateScript('init'),
            this.#generateScript('reset'),
            this.#generateScript('build'),
            this.#generateScript('deploy'),
            this.#generateScript('start'),
            this.#generateScript('setup'),
        )
    }

    #generateScript(name) {
        return { [name]: `npx cdc ${name}` }
    }

    #copyAcceleratorDependencies(dependenciesProperty, newProjectPackageJson, acceleratorInstallationPath) {
        const newProjectAcceleratorPackageJsonPath = path.join(acceleratorInstallationPath, ProjectSetup.PACKAGE_JSON_FILE_NAME)
        const newProjectAcceleratorPackageJson = JSON.parse(fs.readFileSync(newProjectAcceleratorPackageJsonPath, { encoding: 'utf8' }))
        Object.entries(newProjectAcceleratorPackageJson[dependenciesProperty]).forEach((entry) => {
            Object.assign(newProjectPackageJson[dependenciesProperty], { [entry[0]]: entry[1] })
        })
    }

    #getAcceleratorDependencyName(devDependencies) {
        const name = Object.keys(devDependencies).filter((dep) => dep.includes(ProjectSetup.SAP_ORG))
        if (name[0] === undefined) {
            throw new Error(`Cannot find ${ProjectSetup.SAP_ORG} dependency in package.json file`)
        }
        return name[0]
    }

    #copyConfigurationFiles(acceleratorInstallationPath) {
        const rootDirectory = '.'
        this.#copyFile(path.join(acceleratorInstallationPath, '.babelrc'), rootDirectory)
        this.#copyFile(path.join(acceleratorInstallationPath, '.lightserverrc'), rootDirectory)
        this.#copyFile(path.join(acceleratorInstallationPath, '.prettierrc.json'), rootDirectory)
        fs.writeFileSync(path.join(rootDirectory, '.env'), 'USER_KEY=\nSECRET_KEY=')
    }

    #copyFile(src, dest) {
        const fileName = path.parse(src).name
        fs.writeFileSync(path.join(dest, fileName), fs.readFileSync(src, { encoding: 'utf8' }))
    }

    #generateConfigurationFile() {
        const config = {
            source: [
                {
                    apiKey: '',
                },
            ],
            deploy: [
                {
                    apiKey: '',
                },
            ],
        }
        fs.writeFileSync(path.join('.', 'cdc-accelerator.json'), JSON.stringify(config, null, 4))
    }

    #generateIndexHtmlFile() {}

    setup() {
        const newProjectPackageJsonPath = ProjectSetup.PACKAGE_JSON_FILE_NAME
        const newProjectPackageJson = JSON.parse(fs.readFileSync(newProjectPackageJsonPath, { encoding: 'utf8' }))
        const dependencyName = this.#getAcceleratorDependencyName(newProjectPackageJson.devDependencies)
        const acceleratorInstallationPath = path.join('node_modules', ...dependencyName.split(path.sep))

        this.#copyAcceleratorDependencies('devDependencies', newProjectPackageJson, acceleratorInstallationPath)
        this.#generateNpmScripts(newProjectPackageJson)
        fs.writeFileSync(ProjectSetup.PACKAGE_JSON_FILE_NAME, JSON.stringify(newProjectPackageJson, null, 4))
        this.#copyConfigurationFiles(acceleratorInstallationPath)
        this.#generateConfigurationFile()
        this.#generateIndexHtmlFile()
        execSync('npm install', { stdio: 'inherit' })
    }
}
