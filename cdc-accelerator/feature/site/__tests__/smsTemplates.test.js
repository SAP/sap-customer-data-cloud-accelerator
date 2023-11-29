import axios from 'axios'
import SmsTemplates from '../smsTemplates.js'
import { smsExpectedResponse } from '../test.gigyaResponse.sms.js'
import { expectedGigyaResponseNok, getSiteConfig } from '../../__tests__/test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import { credentials, apiKey, srcSiteDirectory } from '../../test.common.js'

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

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(writeFileSyncMock).toHaveBeenCalled()

            const basePath = path.join(srcSiteDirectory, 'SmsTemplates')

            Object.entries(smsExpectedResponse.templates).forEach(([templateTypeName, templateType]) => {
                Object.entries(templateType.globalTemplates.templates).forEach(([language, templateContent]) => {
                    const expectedGlobalFilePath = path.join(basePath, templateTypeName, SmsTemplates.FOLDER_GLOBAL_TEMPLATES, `${language}.txt`)
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
                        otp: {
                            globalTemplates: { templates: {} },
                            templatesPerCountryCode: {},
                        },
                        tfa: {
                            globalTemplates: { templates: {} },
                            templatesPerCountryCode: {},
                        },
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
})
