import Uninstaller from '../uninstaller.js'
import child_process from 'child_process'
import fs from 'fs'
import { CONFIGURATION_FILES } from '../constants.js'

jest.mock('fs')
jest.mock('child_process', () => {
    return {
        execSync: () => '',
    }
})

describe('Installer test suite', () => {
    let newProjectPackageJson, acceleratorPackageJson
    const uninstaller = new Uninstaller()

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
                '@babel/cli': '7.22.6',
                '@babel/core': '7.22.8',
                '@babel/preset-env': '7.22.7',
                anotherDependency: '0.0.1',
            },
            dependencies: {
                'light-server': '2.9.1',
                dotenv: '16.0.3',
            },
        }

        acceleratorPackageJson = {
            name: '@sap_oss/sap-customer-data-cloud-accelerator',
            version: '0.0.1',
            description: 'A development environment for SAP Customer Data Cloud that enables the use of modern tools, such as JavaScript and source control.',
            main: 'index.js',
            type: 'module',
            devDependencies: {
                '@babel/cli': '7.22.6',
                '@babel/core': '7.22.8',
                '@babel/preset-env': '7.22.7',
                'cross-env': '7.0.3',
                jest: '29.6.1',
                'jest-environment-jsdom': '29.6.1',
            },
            dependencies: {
                'light-server': '2.9.1',
                dotenv: '16.0.3',
            },
        }
    })

    test('uninstall successfully', () => {
        const spy = jest.spyOn(child_process, 'execSync')
        uninstaller.uninstall(newProjectPackageJson, acceleratorPackageJson)
        expect(spy.mock.calls.length).toBe(4)
        expect(child_process.execSync).toBeCalledWith(`npm remove @babel/cli`, { stdio: 'inherit' })
        expect(child_process.execSync).toBeCalledWith(`npm remove @babel/core`, { stdio: 'inherit' })
        expect(child_process.execSync).toBeCalledWith(`npm remove @babel/preset-env`, { stdio: 'inherit' })
        expect(child_process.execSync).toBeCalledWith('npm remove light-server', { stdio: 'inherit' })

        CONFIGURATION_FILES.forEach((file) => expect(fs.unlink).toHaveBeenCalledWith(file, expect.anything()))
    })
})