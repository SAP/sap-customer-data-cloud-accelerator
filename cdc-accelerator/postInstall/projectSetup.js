import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default class ProjectSetup {
    static SAP_ORG = '@sap_oss'
    static PACKAGE_JSON_FILE_NAME = 'package.json'

    setup() {
        const newProjectPackageJsonPath = ProjectSetup.PACKAGE_JSON_FILE_NAME
        const newProjectPackageJson = JSON.parse(fs.readFileSync(newProjectPackageJsonPath, { encoding: 'utf8' }))
        const dependencyName = this.#getAcceleratorDependencyName(newProjectPackageJson.devDependencies)
        const acceleratorInstallationPath = path.join('node_modules', ...dependencyName.split(path.sep))

        this.#uninstall(newProjectPackageJson, acceleratorInstallationPath)
        this.#install(newProjectPackageJson, acceleratorInstallationPath)


        // TODO setup upgrade
        // TODO uninstall previous dependencies
    }

    #getAcceleratorDependencyName(devDependencies) {
        const name = Object.keys(devDependencies).filter((dep) => dep.includes(ProjectSetup.SAP_ORG))
        if (name[0] === undefined) {
            throw new Error(`Cannot find ${ProjectSetup.SAP_ORG} dependency in package.json file`)
        }
        return name[0]
    }

    #uninstall(newProjectPackageJson, acceleratorInstallationPath) {

    }

    #install(newProjectPackageJson, acceleratorInstallationPath) {
        this.#generatePackageJsonProperties(newProjectPackageJson, acceleratorInstallationPath)
        this.#copyConfigurationFiles(acceleratorInstallationPath)
        this.#generateConfigurationFile()
        this.#generateIndexHtmlFile(acceleratorInstallationPath)

        execSync('npm install', { stdio: 'inherit' })
    }

    #generatePackageJsonProperties(newProjectPackageJson, acceleratorInstallationPath) {
        const acceleratorPackageJsonPath = path.join(acceleratorInstallationPath, ProjectSetup.PACKAGE_JSON_FILE_NAME)
        const acceleratorPackageJson = JSON.parse(fs.readFileSync(acceleratorPackageJsonPath, { encoding: 'utf8' }))
        this.#copyAcceleratorDependencies('devDependencies', newProjectPackageJson, acceleratorPackageJson)
        this.#generateNpmScripts(newProjectPackageJson)
        this.#generateJestConfiguration(newProjectPackageJson, acceleratorPackageJson)
        this.#copyDependency('light-server', newProjectPackageJson, acceleratorPackageJson)
        fs.writeFileSync(ProjectSetup.PACKAGE_JSON_FILE_NAME, JSON.stringify(newProjectPackageJson, null, 4))
    }

    #copyAcceleratorDependencies(dependenciesProperty, newProjectPackageJson, acceleratorPackageJson) {
        Object.entries(acceleratorPackageJson[dependenciesProperty]).forEach((entry) => {
            Object.assign(newProjectPackageJson[dependenciesProperty], { [entry[0]]: entry[1] })
        })
    }

    #generateNpmScripts(newProjectPackageJson) {
        return Object.assign(
            newProjectPackageJson['scripts'],
            this.#generateScript('init'),
            this.#generateScript('reset'),
            this.#generateScript('build'),
            this.#generateScript('deploy'),
            this.#generateScript('start'),
            this.#generateScript('setup'),
            { test: "jest --collect-coverage --coverage --watch=all --coverageDirectory=coverage/unit ./src" }
        )
    }

    #generateScript(name) {
        return { [name]: `npx cdc ${name}` }
    }

    #generateJestConfiguration(newProjectPackageJson, acceleratorPackageJson) {
        const key = 'jest'
        newProjectPackageJson[key] = acceleratorPackageJson[key]
        delete newProjectPackageJson[key].coveragePathIgnorePatterns
    }

    #copyDependency(dependency, newProjectPackageJson, acceleratorPackageJson) {
        let dependencyContainer = 'devDependencies'
        if(acceleratorPackageJson[dependencyContainer][dependency]) {
            newProjectPackageJson[dependencyContainer][dependency] = acceleratorPackageJson[dependencyContainer][dependency]
        }
        else {
            dependencyContainer = 'dependencies'
            if (acceleratorPackageJson[dependencyContainer][dependency]) {
                newProjectPackageJson[dependencyContainer][dependency] = acceleratorPackageJson[dependencyContainer][dependency]
            }
        }
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
                }
            ],
            deploy: [
                {
                    apiKey: '',
                }
            ]
        }
        fs.writeFileSync(path.join('.', 'cdc-accelerator.json'), JSON.stringify(config, null, 4))
    }

    #generateIndexHtmlFile(acceleratorInstallationPath) {
        const templatePath = path.join(acceleratorInstallationPath, 'cdc-accelerator', 'templates', 'preview', 'index.html')
        let content = fs.readFileSync(templatePath, { encoding: 'utf8' })
        content = this.#replaceLinks(content, acceleratorInstallationPath)
        fs.writeFileSync(path.join('src', 'index.html'), content)
    }

    #replaceLinks(content, acceleratorInstallationPath) {
        const oldLink = path.join('..', 'cdc-accelerator', 'preview')
        const newLink = path.join('..', acceleratorInstallationPath, 'cdc-accelerator', 'preview')
        let lines = content.split('\n')
        lines = lines.map((line) => {
            if (!line.includes(oldLink)) {
                return line
            }
            line.replace(oldLink, newLink)
        })
        return lines
    }
}
