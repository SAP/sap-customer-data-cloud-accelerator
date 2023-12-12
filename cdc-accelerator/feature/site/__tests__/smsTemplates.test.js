import axios from 'axios'
import SmsTemplates from '../smsTemplates.js'
import { smsExpectedResponse } from './test.gigyaResponse.sms.js'
import { expectedGigyaResponseNok, getSiteConfig } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import { credentials, apiKey, srcSiteDirectory } from '../../__tests__/test.common.js'

jest.mock('fs')
jest.mock('axios')
const buildSiteDirectory = path.join(__dirname, '../site/build/smsTemplates')

describe('Sms templates test suite', () => {
    let smsTemplates

    beforeEach(() => {
        jest.clearAllMocks()
        smsTemplates = new SmsTemplates(credentials)
    })

    describe('Init test suite', () => {
        test('all sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: smsExpectedResponse })
            fs.existsSync.mockReturnValue(false)
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(writeFileSyncMock).toHaveBeenCalled()

            const basePath = path.join(srcSiteDirectory, 'SmsTemplates')

            Object.entries(smsExpectedResponse.templates).forEach(([templateTypeName, templateType]) => {
                Object.entries(templateType.globalTemplates.templates).forEach(([language, templateContent]) => {
                    const expectedGlobalFilePath = path.join(
                        basePath,
                        templateTypeName,
                        SmsTemplates.FOLDER_GLOBAL_TEMPLATES,
                        `${language}${language === templateType.globalTemplates.defaultLanguage ? '-default' : ''}.txt`,
                    )
                    expect(writeFileSyncMock).toHaveBeenCalledWith(expect.stringContaining(expectedGlobalFilePath), expect.stringContaining(templateContent))
                })

                Object.entries(templateType.templatesPerCountryCode).forEach(([countryCode, countryTemplates]) => {
                    Object.entries(countryTemplates.templates).forEach(([language, templateContent]) => {
                        const expectedCountryFilePath = path.join(basePath, templateTypeName, SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE, countryCode, `${language}.txt`)
                        expect(writeFileSyncMock).toHaveBeenCalledWith(expect.stringContaining(expectedCountryFilePath), expect.stringContaining(templateContent))
                    })
                })
            })

            writeFileSyncMock.mockRestore()
        })

        test('minimum sms templates files are not generated when no response is received', async () => {
            axios.mockResolvedValueOnce({
                data: {
                    templates: {
                        otp: { globalTemplates: { templates: {} }, templatesPerCountryCode: {} },
                        tfa: { globalTemplates: { templates: {} }, templatesPerCountryCode: {} },
                    },
                },
            })

            fs.existsSync.mockReturnValue(false)
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(writeFileSyncMock).not.toHaveBeenCalled()
            writeFileSyncMock.mockRestore()
        })

        test('get sms templates failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('feature directory already exists', async () => {
            axios.mockResolvedValueOnce({ data: smsExpectedResponse })
            fs.existsSync.mockReturnValue(true)

            await expect(smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        srcSiteDirectory,
                        smsTemplates.getName(),
                    )}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })
    })
    describe('Reset test suite', () => {
        test('reset with existing folder', () => {
            testReset(true)
        })

        test('reset with non-existing folder', () => {
            testReset(false)
        })

        function testReset(dirExists) {
            fs.existsSync.mockReturnValue(dirExists)
            fs.rmSync.mockReturnValue(undefined)

            smsTemplates.reset(srcSiteDirectory)

            const featureDirectory = path.join(srcSiteDirectory, smsTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
    describe('Build test suite', () => {
        test('SMS templates are built successfully', () => {
            const mockFs = {
                [path.join(srcSiteDirectory, 'SmsTemplates', 'otp')]: {
                    globalTemplates: ['en-default.txt', 'nl.txt'],
                    templatesPerCountryCode: {
                        244: ['pt.txt'],
                    },
                },
                [path.join(srcSiteDirectory, 'SmsTemplates', 'tfa')]: {
                    globalTemplates: ['en-default.txt', 'nl.txt'],
                },
            }

            fs.readdirSync.mockImplementation((dirPath) => {
                const entries = mockFs[dirPath] || {}
                return Object.keys(entries).concat(entries instanceof Array ? entries : [])
            })

            fs.existsSync.mockImplementation((path) => !!mockFs[path])

            fs.statSync.mockImplementation((path) => ({
                isFile: () => typeof mockFs[path] === 'undefined',
                isDirectory: () => typeof mockFs[path] !== 'undefined',
            }))

            fs.readFileSync.mockReturnValue('Template content')
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync')

            const smsTemplates = new SmsTemplates(credentials)
            smsTemplates.build(buildSiteDirectory)
        })

        test('No SMS templates are built when no files are present', () => {
            fs.readdirSync.mockReturnValue([])
            fs.existsSync.mockReturnValue(true)
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

            const smsTemplates = new SmsTemplates(credentials)
            smsTemplates.build('buildSiteDirectory')

            expect(writeFileSyncMock).not.toHaveBeenCalled()
        })
    })
    describe('Deploy test suite', () => {
        test('successful deploy of multiple SMS templates', async () => {
            axios.mockResolvedValue({ data: { errorCode: 0 } })
            fs.readdirSync.mockReturnValueOnce(['en.txt']).mockReturnValueOnce(['es.txt'])
            fs.statSync.mockReturnValue({ isDirectory: () => true })
            fs.readFileSync.mockImplementation((filePath) => {
                if (filePath.includes('en.txt')) return 'Your verification code is: {{code}}'
                if (filePath.includes('es.txt')) return 'Su código de verificación es: {{code}}'
            })
            const response = await smsTemplates.deploy(apiKey, getSiteConfig, buildSiteDirectory)

            expect(response.errorCode).toBe(0)
        })

        test('deploy with no SMS templates', async () => {
            axios.mockResolvedValue({ data: { errorCode: 0 } })
            fs.readdirSync.mockReturnValue([])

            const response = await smsTemplates.deploy(apiKey, getSiteConfig, buildSiteDirectory)

            expect(response.errorCode).toBe(0)
        })

        test('deploy handles API errors', async () => {
            axios.mockResolvedValue({ data: { errorCode: 1, errorMessage: 'API error' } })

            fs.readdirSync.mockReturnValue(['en.txt'])
            fs.statSync.mockImplementation((path) => ({
                isFile: () => !path.includes('directory'),
                isDirectory: () => path.includes('directory'),
            }))
            fs.readFileSync.mockReturnValue('Your verification code is: {{code}}')

            await expect(smsTemplates.deploy(apiKey, getSiteConfig, buildSiteDirectory)).rejects.toThrow('API error')
        })
    })
})
