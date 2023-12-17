import fs from 'fs'
import path from 'path'
import { CONFIGURATION_FILES, PACKAGE_JSON_FILE_NAME, PREVIEW_DIRECTORY } from './constants.js'
import { CDC_ACCELERATOR_DIRECTORY, CONFIG_FILENAME, Operations, PREVIEW_FILE_NAME, SRC_DIRECTORY } from '../core/constants.js'
import Terminal from '../core/terminal.js'

export default class Installer {
    install(newProjectPackageJson, acceleratorInstallationPath, acceleratorPackageJson) {
        this.generatePackageJsonProperties(newProjectPackageJson, acceleratorPackageJson)
        this.copyConfigurationFiles(acceleratorInstallationPath)
        this.generateConfigurationFile()
        this.generatePreviewFile(acceleratorInstallationPath)

        Terminal.executeCommand('npm install', { shell: false, stdio: 'inherit' })
    }

    generatePackageJsonProperties(newProjectPackageJson, acceleratorPackageJson) {
        this.#copyAcceleratorDependencies('devDependencies', newProjectPackageJson, acceleratorPackageJson)
        this.#generateNpmScripts(newProjectPackageJson)
        this.#generateJestConfiguration(newProjectPackageJson)
        this.#copyDependency('light-server', newProjectPackageJson, acceleratorPackageJson)
        fs.writeFileSync(PACKAGE_JSON_FILE_NAME, JSON.stringify(newProjectPackageJson, null, 4))
    }

    #copyAcceleratorDependencies(dependenciesProperty, newProjectPackageJson, acceleratorPackageJson) {
        Object.entries(acceleratorPackageJson[dependenciesProperty]).forEach((entry) => {
            if (!this.#containsForbiddenCharacters(entry[0])) {
                Object.assign(newProjectPackageJson[dependenciesProperty], { [entry[0]]: entry[1] })
            }
        })
    }

    #containsForbiddenCharacters(dependency) {
        return dependency.match(/[*?:;,&|+]/) ? true : false
    }

    #generateNpmScripts(newProjectPackageJson) {
        return Object.assign(
            newProjectPackageJson['scripts'],
            this.#generateScript(Operations.init),
            this.#generateScript(Operations.reset),
            this.#generateScript(Operations.build),
            this.#generateScript(Operations.deploy),
            this.#generateScript(Operations.start),
            this.#generateScript('setup'),
            { test: `jest --collect-coverage --coverage --watch=all --coverageDirectory=coverage/unit ${SRC_DIRECTORY}` },
        )
    }

    #generateScript(name) {
        return { [name]: `npx cdc ${name}` }
    }

    #generateJestConfiguration(newProjectPackageJson) {
        const jest = {
            testPathIgnorePatterns: ['build/'],
            coveragePathIgnorePatterns: ['build/'],
            testEnvironment: 'jsdom',
        }
        newProjectPackageJson['jest'] = jest
    }

    #copyDependency(dependency, newProjectPackageJson, acceleratorPackageJson) {
        let dependencyContainer = 'devDependencies'
        if (acceleratorPackageJson[dependencyContainer][dependency]) {
            newProjectPackageJson[dependencyContainer][dependency] = acceleratorPackageJson[dependencyContainer][dependency]
        } else {
            dependencyContainer = 'dependencies'
            if (acceleratorPackageJson[dependencyContainer][dependency]) {
                if (newProjectPackageJson[dependencyContainer] === undefined) {
                    newProjectPackageJson[dependencyContainer] = {}
                }
                newProjectPackageJson[dependencyContainer][dependency] = acceleratorPackageJson[dependencyContainer][dependency]
            }
        }
    }

    copyConfigurationFiles(acceleratorInstallationPath) {
        const rootDirectory = '.'
        CONFIGURATION_FILES.forEach((file) => this.#copyFile(path.join(acceleratorInstallationPath, file), rootDirectory))
        const envFilePath = '.env'
        if (!fs.existsSync(envFilePath)) {
            // do not overwrite .env file
            fs.writeFileSync(envFilePath, 'USER_KEY=\nSECRET_KEY=')
        }
    }

    #copyFile(src, dest) {
        const idx = src.lastIndexOf(path.sep)
        const fileName = idx === -1 ? src : src.substring(idx)
        fs.writeFileSync(path.join(dest, fileName), fs.readFileSync(src, { encoding: 'utf8' }))
    }

    generateConfigurationFile() {
        if (fs.existsSync(CONFIG_FILENAME)) {
            // do not overwrite CONFIG_FILENAME file
            return
        }
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
        fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(config, null, 4))
    }

    generatePreviewFile(acceleratorInstallationPath) {
        const indexHtmlFileName = PREVIEW_FILE_NAME
        if (fs.existsSync(indexHtmlFileName)) {
            // do not overwrite index.html file
            return
        }
        const templatePath = path.join(acceleratorInstallationPath, CDC_ACCELERATOR_DIRECTORY, 'templates', PREVIEW_DIRECTORY, indexHtmlFileName)
        let content = fs.readFileSync(templatePath, { encoding: 'utf8' })
        content = this.#replaceLinks(content, acceleratorInstallationPath)
        if (!fs.existsSync(SRC_DIRECTORY)) {
            fs.mkdirSync(SRC_DIRECTORY, { recursive: true })
        }
        fs.writeFileSync(path.join(SRC_DIRECTORY, indexHtmlFileName), content)
    }

    #replaceLinks(content, acceleratorInstallationPath) {
        const oldLink = path.join('..', CDC_ACCELERATOR_DIRECTORY, PREVIEW_DIRECTORY)
        const newLink = path.join('..', acceleratorInstallationPath, CDC_ACCELERATOR_DIRECTORY, PREVIEW_DIRECTORY)
        let lines = content.split('\n')
        lines = lines.map((line) => {
            if (line.includes(oldLink)) {
                line = line.replace(oldLink, newLink)
            }
            return line
        })
        return lines.join('\n')
    }
}
