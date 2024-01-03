import Project from '../project.js'
import Uninstaller from '../uninstaller.js'
import Installer from '../installer.js'
import fs from 'fs'
import path from 'path'
import { PREVIEW_DIRECTORY, SAP_ORG } from '../constants.js'
import { CDC_ACCELERATOR_DIRECTORY, PREVIEW_FILE_NAME, SRC_DIRECTORY, TEMPLATES_DIRECTORY } from '../../core/constants'

jest.mock('fs')
jest.mock('../uninstaller.js')
jest.mock('../installer.js')

describe('Project test suite', () => {
    let spyUninstall, spyInstall, spyGeneratePreviewFile
    const projectName = 'sap-customer-data-cloud-accelerator'
    const acceleratorPackageJson = {
        devDependencies: {
            '@babel/cli': '7.22.6',
            '@babel/core': '7.22.8',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
        spyUninstall = jest.spyOn(Uninstaller.prototype, 'uninstall')
        spyInstall = jest.spyOn(Installer.prototype, 'install')
        spyGeneratePreviewFile = jest.spyOn(Installer.prototype, 'generatePreviewFile')
    })
    test('setup successfully', async () => {
        const newProjectPackageJson = {
            devDependencies: {
                [path.join(SAP_ORG, projectName)]: `file:../${projectName}`,
            },
        }
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(newProjectPackageJson)).mockReturnValueOnce(JSON.stringify(acceleratorPackageJson))
        expect(new Project().setup()).toBeTruthy()
        expect(spyUninstall).toBeCalledWith(newProjectPackageJson, acceleratorPackageJson)
        expect(spyInstall).toBeCalledWith(newProjectPackageJson, path.join('node_modules', SAP_ORG, projectName), acceleratorPackageJson)
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

    test('copy preview template successfully on new project', async () => {
        const newProjectPackageJson = {
            devDependencies: {
                [path.join(SAP_ORG, projectName)]: `file:../${projectName}`,
            },
        }
        fs.existsSync.mockReturnValueOnce(false)
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(newProjectPackageJson))
        Project.copyPreviewTemplateIfNotExists()
        expect(spyGeneratePreviewFile).toHaveBeenCalledWith(path.join('node_modules', SAP_ORG, projectName))
    })

    test('copy preview template successfully on accelerator project', async () => {
        const newProjectPackageJson = {}
        fs.existsSync.mockReturnValueOnce(false)
        fs.readFileSync.mockReturnValueOnce(JSON.stringify(newProjectPackageJson))
        Project.copyPreviewTemplateIfNotExists()
        expect(fs.copyFileSync).toHaveBeenCalledWith(
            path.join(CDC_ACCELERATOR_DIRECTORY, TEMPLATES_DIRECTORY, PREVIEW_DIRECTORY, PREVIEW_FILE_NAME),
            path.join(SRC_DIRECTORY, PREVIEW_FILE_NAME),
        )
    })
})
