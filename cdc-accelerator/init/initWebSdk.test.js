import fs from 'fs'
import { srcDirectory, srcFile, templateWebSdkPath, expectedGlobalConf } from './testCommon.js'
import { initWebSdk } from './initWebSdk.js'

// Mock fs module
jest.mock('fs')

describe('InitWebSdk test suite', () => {
    beforeEach(() => {
        fs.existsSync.mockReset()
        fs.readFileSync.mockReset()
        fs.rmSync.mockReset()
        fs.mkdirSync.mockReset()
        fs.writeFileSync.mockReset()
    })

    const siteConfigWithoutSdk = {}

    it('should create a new webSdk file with existing globalConf', async () => {
        const testConfig = {
            isExistingFile: true,
            reset: true,
            siteConfig: expectedGlobalConf,
        }

        await runWebSdkTest(testConfig)
    })

    it('should create a new webSdk file with default template when globalConf is empty', async () => {
        const testConfig = {
            isExistingFile: false,
            reset: false,
            siteConfig: {},
        }

        await runWebSdkTest(testConfig)
    })

    it('should throw an error when reset is false and srcDirectory already exists', async () => {
        fs.existsSync.mockReturnValue(true)

        try {
            await initWebSdk({
                reset: false,
                siteConfig: siteConfigWithoutSdk,
                srcFile,
                srcDirectory,
                templateWebSdk: templateWebSdkPath,
            })
        } catch (error) {
            expect(error.message).toBe(`The "${srcDirectory}" directory already exists, to overwrite it's contents please use the option "reset" instead of "init"`)
        }

        expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
        expect(fs.mkdirSync).not.toHaveBeenCalled()
        expect(fs.writeFileSync).not.toHaveBeenCalled()
        expect(fs.rmSync).not.toHaveBeenCalled()
    })

    it('should remove existing src/webSdk directory when reset is true', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockReturnValue(`${expectedGlobalConf}`)
        await initWebSdk({
            reset: true,
            siteConfig: expectedGlobalConf,
            srcFile,
            srcDirectory,
            templateWebSdk: templateWebSdkPath,
        })

        expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
        expect(fs.rmSync).toHaveBeenCalledWith(srcDirectory, { recursive: true, force: true })
        expect(fs.mkdirSync).toHaveBeenCalledWith(srcDirectory, { recursive: true })
        expect(fs.writeFileSync).toHaveBeenCalledWith(srcFile, `export default ${expectedGlobalConf}`)
    })
})

async function runWebSdkTest(testConfig) {
    const { isExistingFile, reset, siteConfig } = testConfig

    fs.existsSync.mockReturnValue(isExistingFile)
    fs.readFileSync.mockReturnValue(siteConfig)

    await initWebSdk({
        reset,
        siteConfig,
        srcFile,
        srcDirectory,
        templateWebSdk: templateWebSdkPath,
    })

    expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
    expect(fs.writeFileSync).toHaveBeenCalledWith(srcFile, `export default ${siteConfig}`)
}
