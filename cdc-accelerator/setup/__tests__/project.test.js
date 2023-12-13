import Project from '../project.js'
import Uninstaller from '../uninstaller.js'
import Installer from '../installer.js'
import fs from 'fs'
import path from 'path'

jest.mock('fs')
jest.mock('../uninstaller.js')
jest.mock('../installer.js')

describe('Project test suite', () => {
    let spyUninstall, spyInstall
    const acceleratorPackageJson = {
        devDependencies: {
            '@babel/cli': '7.22.6',
            '@babel/core': '7.22.8',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        spyUninstall = jest.spyOn(Uninstaller.prototype, 'uninstall')
        spyInstall = jest.spyOn(Installer.prototype, 'install')
    })
    test('setup successfully', async () => {
        const newProjectPackageJson = {
            devDependencies: {
                '@sap_oss/sap-customer-data-cloud-accelerator': 'file:../sap-customer-data-cloud-accelerator',
            },
        }
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(newProjectPackageJson)).mockReturnValueOnce(JSON.stringify(acceleratorPackageJson))
        expect(new Project().setup()).toBeTruthy()
        expect(spyUninstall).toBeCalledWith(newProjectPackageJson, acceleratorPackageJson)
        expect(spyInstall).toBeCalledWith(newProjectPackageJson, path.join('node_modules', '@sap_oss', 'sap-customer-data-cloud-accelerator'), acceleratorPackageJson)
    })

    test('can not find accelerator dependency', async () => {
        const newProjectPackageJson = {
            devDependencies: {
                '@babel/cli': '7.22.6',
            },
        }
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(newProjectPackageJson)).mockReturnValueOnce(JSON.stringify(acceleratorPackageJson))
        expect(new Project().setup()).toBeFalsy()
        expect(spyUninstall).not.toHaveBeenCalled()
        expect(spyInstall).not.toHaveBeenCalled()
    })
})
