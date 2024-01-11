import axios from 'axios'
import SmsTemplates from '../smsTemplates.js'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from '../../../core/constants.js'
import { smsExpectedResponse } from './test.gigyaResponse.sms.js'
import { expectedGigyaResponseNok, getSiteConfig } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import { credentials, apiKey, srcSiteDirectory } from '../../__tests__/test.common.js'

jest.mock('fs')
jest.mock('axios')

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

            fs.readdirSync.mockImplementation((dirPath) => {
                if (dirPath.includes(SmsTemplates.FOLDER_GLOBAL_TEMPLATES)) {
                    return ['en.txt', '.DS_Store']
                }
                return []
            })

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(writeFileSyncMock).toHaveBeenCalled()

            const basePath = path.join(srcSiteDirectory, 'SmsTemplates')

            Object.entries(smsExpectedResponse.templates).forEach(([templateTypeName, templateType]) => {
                Object.entries(templateType.globalTemplates.templates).forEach(([language, templateContent]) => {
                    const expectedGlobalFilePath = path.join(
                        basePath,
                        templateTypeName,
                        SmsTemplates.FOLDER_GLOBAL_TEMPLATES,
                        `${language}${language === templateType.globalTemplates.defaultLanguage ? '.default' : ''}.txt`,
                    )
                    expect(writeFileSyncMock).toHaveBeenCalledWith(expect.stringContaining(expectedGlobalFilePath), expect.stringContaining(templateContent))
                })

                if (templateType.templatesPerCountryCode) {
                    Object.entries(templateType.templatesPerCountryCode).forEach(([countryCode, countryTemplates]) => {
                        Object.entries(countryTemplates.templates).forEach(([language, templateContent]) => {
                            const expectedCountryFilePath = path.join(
                                basePath,
                                templateTypeName,
                                SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE,
                                countryCode,
                                `${language}${language === countryTemplates.defaultLanguage ? '.default' : ''}.txt`,
                            )
                            expect(writeFileSyncMock).toHaveBeenCalledWith(expect.stringContaining(expectedCountryFilePath), expect.stringContaining(templateContent))
                        })
                    })
                }
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
                [path.join(SRC_DIRECTORY, smsTemplates.getName(), SmsTemplates.FOLDER_OTP)]: {
                    isDirectory: true,
                    contents: {
                        'en.default.txt': 'Your verification code is: {{code}}',
                        'nl.txt': 'Uw verificatiecode is: {{code}}',
                    },
                },
                [path.join(SRC_DIRECTORY, smsTemplates.getName(), SmsTemplates.FOLDER_TFA)]: {
                    isDirectory: true,
                    contents: {
                        'en.default.txt': 'Your verification code is: {{code}}',
                        'nl.txt': 'Je bevestigingscode is:{{code}}',
                    },
                },
            }

            fs.readdirSync.mockImplementation((dirPath) => {
                const dir = mockFs[dirPath]
                return dir && dir.isDirectory ? Object.keys(dir.contents) : []
            })

            fs.existsSync.mockImplementation((path) => {
                return !!mockFs[path]
            })

            fs.statSync.mockImplementation((path) => {
                return {
                    isFile: () => mockFs[path] && !mockFs[path].isDirectory,
                    isDirectory: () => mockFs[path] && mockFs[path].isDirectory,
                }
            })

            fs.readFileSync.mockReturnValue('Template content')
            const copyFileSyncMock = jest.spyOn(fs, 'copyFileSync')

            smsTemplates.build(SRC_DIRECTORY)

            expect(copyFileSyncMock).toHaveBeenCalled()
        })

        test('No SMS templates are built when no files are present', () => {
            fs.readdirSync.mockReturnValue([])
            fs.existsSync.mockReturnValue(true)
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

            const smsTemplates = new SmsTemplates(credentials)
            smsTemplates.build(BUILD_DIRECTORY)

            expect(writeFileSyncMock).not.toHaveBeenCalled()
        })
    })
    describe('Deploy test suite', () => {
        test('SMS templates deploy fails with multiple default files in a folder', async () => {
            fs.existsSync.mockReturnValue(true)
            fs.readdirSync.mockImplementation((dirPath) => {
                if (dirPath.endsWith(SmsTemplates.FOLDER_GLOBAL_TEMPLATES)) {
                    return ['en.default.txt', 'es.default.txt']
                }
                if (dirPath.includes(SmsTemplates.FOLDER_GLOBAL_TEMPLATES)) {
                    return ['en.txt', '.DS_Store']
                }
                return []
            })
            const folderPath = path.join(srcSiteDirectory, smsTemplates.getName(), SmsTemplates.FOLDER_OTP, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
            const expectedErrorMessage = `There cannot be two default files in the same folder. Check the folder: ${folderPath}`
            await expect(smsTemplates.deploy(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toThrow(new Error(expectedErrorMessage))
        })

        test('SMS duplicate Default Files Error', async () => {
            axios.mockResolvedValue({ data: smsExpectedResponse })

            const smsDefaultError = {
                otp: {
                    globalTemplates: {
                        templates: {
                            en: 'Your verification code is: {{code}}',
                            es: 'El código de verificación es: {{code}}',
                        },
                        defaultLanguage: 'en',
                    },
                },
            }

            fs.existsSync.mockReturnValue(true)
            fs.readdirSync.mockImplementation((dirPath) => {
                if (dirPath.endsWith(SmsTemplates.FOLDER_GLOBAL_TEMPLATES)) {
                    return ['en.default.txt', 'es.default.txt']
                }
                return []
            })
            fs.readFileSync.mockImplementation((filePath) => {
                const templateKey = filePath.split('/').pop().split('.txt')[0]
                return smsDefaultError.otp.globalTemplates.templates[templateKey]
            })

            const smsTemplates = new SmsTemplates(credentials)
            const siteDirectory = srcSiteDirectory

            const expectedErrorMessage = `There cannot be two default files in the same folder. Check the folder: ${path.join(
                siteDirectory,
                'SmsTemplates',
                'otp',
                'globalTemplates',
            )}`

            await expect(smsTemplates.deploy(apiKey, getSiteConfig, siteDirectory)).rejects.toThrow(new Error(expectedErrorMessage))
        })

        test('successful deploy of multiple SMS templates', async () => {
            axios.mockResolvedValue({ data: { errorCode: 0 } })
            fs.readdirSync.mockImplementation((dirPath) => {
                if (dirPath.endsWith(SmsTemplates.FOLDER_GLOBAL_TEMPLATES)) {
                    return ['en.txt', 'es.txt']
                }
                return []
            })
            fs.readFileSync.mockImplementation((filePath) => {
                if (filePath.includes('en.txt')) return 'Your verification code is: {{code}}'
                if (filePath.includes('es.txt')) return 'Su código de verificación es: {{code}}'
                return null
            })

            const response = await smsTemplates.deploy(apiKey, getSiteConfig, BUILD_DIRECTORY)
            expect(response.errorCode).toBe(0)
        })

        test('deploy with no SMS templates', async () => {
            axios.mockResolvedValue({ data: { errorCode: 0 } })
            fs.readdirSync.mockReturnValue([])

            const response = await smsTemplates.deploy(apiKey, getSiteConfig, BUILD_DIRECTORY)

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

            await expect(smsTemplates.deploy(apiKey, getSiteConfig, BUILD_DIRECTORY)).rejects.toThrow('API error')
        })
    })
})
