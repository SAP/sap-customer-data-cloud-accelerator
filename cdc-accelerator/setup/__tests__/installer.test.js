import Installer from '../installer.js'
import { CDC_ACCELERATOR_DIRECTORY, CONFIG_FILENAME, Operations, PREVIEW_FILE_NAME, SRC_DIRECTORY, PACKAGE_JSON_FILE_NAME } from '../../core/constants.js'
import fs from 'fs'
import path from 'path'
import { CONFIGURATION_FILES, PREVIEW_DIRECTORY, SAP_ORG } from '../constants.js'
import Terminal from '../../core/terminal.js'

jest.mock('child_process')
jest.mock('fs')

describe('Installer test suite', () => {
    let newProjectPackageJson, acceleratorPackageJson
    const installer = new Installer()

    beforeEach(() => {
        jest.clearAllMocks()
        newProjectPackageJson = {
            name: 'newProject',
            version: '1.0.0',
            description: '',
            main: 'index.js',
            scripts: {
                test: 'echo "Error: no test specified" && exit 1',
            },
            author: '',
            license: 'ISC',
            devDependencies: {
                '@sap_oss/sap-customer-data-cloud-accelerator': 'file:../sap-customer-data-cloud-accelerator',
            },
        }

        acceleratorPackageJson = {
            name: '@sap_oss/sap-customer-data-cloud-accelerator',
            version: '0.0.1',
            description: 'A development environment for SAP Customer Data Cloud that enables the use of modern tools, such as JavaScript and source control.',
            main: 'index.js',
            type: 'module',
            scripts: {
                test: 'cross-env CI=true npm run update-sap-cdc-toolkit && jest --collect-coverage --coverage --watch=all --coverageDirectory=coverage/unit ./cdc-accelerator/core ./cdc-accelerator/feature',
                'test:e2e': 'cross-env E2E=true CI=true jest -i cdc-accelerator/scripts',
                init: 'cdc-accelerator/core/index.js init',
                reset: 'cdc-accelerator/core/index.js reset',
                build: 'cdc-accelerator/core/index.js build',
                deploy: 'cdc-accelerator/core/index.js deploy',
                start: 'cdc-accelerator/core/index.js start',
                'update-sap-cdc-toolkit': 'node cdc-accelerator/scripts/updateSapCdcToolkit.js',
            },
            jest: {
                testPathIgnorePatterns: ['<rootDir>/build/', 'cdc-accelerator/feature/__tests__/test.gigyaResponses.js'],
                coveragePathIgnorePatterns: ['cdc-accelerator/scripts/'],
                testEnvironment: 'jsdom',
            },
            devDependencies: {
                '@babel/cli': '7.22.6',
                '@babel/core': '7.22.8',
                '@babel/preset-env': '7.22.7',
                'babel-cli': '6.26.0',
                'babel-plugin-transform-import-meta': '2.2.1',
                'babel-preset-env': '1.7.0',
                'cross-env': '7.0.3',
                jest: '29.6.1',
                'jest-environment-jsdom': '29.6.1',
                'jest-location-mock': '1.0.10',
                prettier: '2.8.8',
            },
            dependencies: {
                'light-server': '2.9.1',
                dotenv: '16.0.3',
            },
        }
    })

    test('generatePackageJsonProperties successfully', () => {
        installer.generatePackageJsonProperties(newProjectPackageJson, acceleratorPackageJson)
        delete newProjectPackageJson.devDependencies['@sap_oss/sap-customer-data-cloud-accelerator']
        expect(newProjectPackageJson.devDependencies).toEqual(acceleratorPackageJson.devDependencies)

        const expectedScripts = ['test', ...Object.keys(Operations), 'setup']
        expect(Object.keys(newProjectPackageJson.scripts)).toEqual(expectedScripts)
        expect(newProjectPackageJson.scripts.test).toContain('jest --collect-coverage')

        expect(newProjectPackageJson.jest).toBeDefined()

        expect(newProjectPackageJson.dependencies['light-server']).toBeDefined()

        expect(fs.writeFileSync).toHaveBeenCalledWith(PACKAGE_JSON_FILE_NAME, expect.anything())
    })

    test('copyConfigurationFiles except .env', () => {
        const fileContent = 'USER_KEY=\nSECRET_KEY='
        fs.readFileSync.mockReturnValue(fileContent)
        fs.existsSync.mockReturnValue(true)
        installer.copyConfigurationFiles('')
        CONFIGURATION_FILES.forEach((file) => expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('.', file), fileContent))
        expect(fs.writeFileSync).not.toHaveBeenCalledWith(path.join('.', '.env'), fileContent)
    })

    test('copyConfigurationFiles all', () => {
        const fileContent = 'USER_KEY=\nSECRET_KEY='
        fs.readFileSync.mockReturnValue(fileContent)
        fs.existsSync.mockReturnValue(false)
        installer.copyConfigurationFiles('')
        CONFIGURATION_FILES.forEach((file) => expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('.', file), fileContent))
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('.', '.env'), fileContent)
    })

    test('generateConfigurationFile skip', () => {
        fs.existsSync.mockReturnValue(true)
        installer.generateConfigurationFile()
        expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('generateConfigurationFile', () => {
        const fileContent = { source: [{ apiKey: '' }], deploy: [{ apiKey: '' }] }
        fs.existsSync.mockReturnValue(false)
        installer.generateConfigurationFile()
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join('.', CONFIG_FILENAME), JSON.stringify(fileContent, null, 4))
    })

    test('generatePreviewFile skip', () => {
        fs.existsSync.mockReturnValue(true)
        installer.generatePreviewFile('')
        expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('generatePreviewFile and create src directory', () => {
        testGeneratePreviewFile(true)
    })

    test('generatePreviewFile and skip create src directory', () => {
        testGeneratePreviewFile(false)
    })

    test('generateGitData', () => {
        const fileContent = 'USER_KEY=\nSECRET_KEY='
        fs.readFileSync.mockReturnValue(fileContent)
        const terminalSpy = jest.spyOn(Terminal, 'executeCommand').mockImplementation(() => {})
        installer.generateGitData('')
        expect(terminalSpy).toHaveBeenCalledWith('git init')
        expect(fs.writeFileSync).toHaveBeenCalledWith('.gitignore', fileContent)
        expect(fs.readFileSync).toHaveBeenCalledWith(path.join('cdc-accelerator', 'templates', 'gitignore'), { encoding: 'utf8' })
    })

    function testGeneratePreviewFile(createSrcDirectory) {
        const acceleratorInstallationPath = path.join('node_modules', SAP_ORG, 'sap-customer-data-cloud-accelerator')
        const oldLink = path.join('..', CDC_ACCELERATOR_DIRECTORY, PREVIEW_DIRECTORY)
        const newLink = path.join('..', acceleratorInstallationPath, CDC_ACCELERATOR_DIRECTORY, PREVIEW_DIRECTORY)
        const fileContent = `<html>\n<body>\n<img src='${oldLink}/anything'/>\n<a href='${oldLink}/otherthing'/>\n</body>\n</html>`
        const expectedFileContent = `<html>\n<body>\n<img src='${newLink}/anything'/>\n<a href='${newLink}/otherthing'/>\n</body>\n</html>`
        fs.readFileSync.mockReturnValue(fileContent)
        fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(!createSrcDirectory)
        installer.generatePreviewFile(acceleratorInstallationPath)
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(SRC_DIRECTORY, PREVIEW_FILE_NAME), expectedFileContent)
        if (createSrcDirectory) {
            expect(fs.mkdirSync).toHaveBeenCalledWith(SRC_DIRECTORY, { recursive: true })
        } else {
            expect(fs.mkdirSync).not.toHaveBeenCalled()
        }
    }
})
