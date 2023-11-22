import axios from 'axios'
import SmsTemplates from './smsTemplates.js'
import { smsExpectedResponse, getSmsExpectedResponseWithMinimumTemplates } from './test.gigyaResponse.sms.js'
import { expectedGigyaResponseNok, getSiteConfig } from './test.gigyaResponses.js'
import fs from 'fs'
import path from 'path'
import { credentials, apiKey, srcSiteDirectory } from './test.common.js'

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

        test('minimum sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: getSmsExpectedResponseWithMinimumTemplates() })
            fs.existsSync.mockReturnValue(false)
            const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(writeFileSyncMock).toHaveBeenCalledWith(expect.any(String), expect.any(String))

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

        test('has necessary properties with correct types', () => {
            expect(smsExpectedResponse).toHaveProperty('callId')
            expect(typeof smsExpectedResponse.callId).toBe('string')

            expect(smsExpectedResponse).toHaveProperty('errorCode')
            expect(typeof smsExpectedResponse.errorCode).toBe('number')

            expect(smsExpectedResponse).toHaveProperty('templates')
            expect(typeof smsExpectedResponse.templates).toBe('object')

            expect(smsExpectedResponse.templates).toHaveProperty('otp')
            expect(typeof smsExpectedResponse.templates.otp).toBe('object')

            expect(smsExpectedResponse.templates).toHaveProperty('tfa')
            expect(typeof smsExpectedResponse.templates.tfa).toBe('object')
        })

        test('otp and tfa templates have expected structure', () => {
            const otpTemplate = smsExpectedResponse.templates.otp
            const tfaTemplate = smsExpectedResponse.templates.tfa

            ;['otp', 'tfa'].forEach((templateType) => {
                expect(otpTemplate).toHaveProperty('globalTemplates')
                expect(typeof otpTemplate.globalTemplates).toBe('object')

                expect(otpTemplate.globalTemplates).toHaveProperty('templates')
                expect(typeof otpTemplate.globalTemplates.templates).toBe('object')

                ;['en', 'nl', 'es'].forEach((lang) => {
                    expect(otpTemplate.globalTemplates.templates).toHaveProperty(lang)
                    expect(typeof otpTemplate.globalTemplates.templates[lang]).toBe('string')
                })
            })
        })

        test('getSmsExpectedResponseWithMinimumTemplates returns simplified structure', () => {
            const minimalResponse = getSmsExpectedResponseWithMinimumTemplates()
            expect(minimalResponse).toHaveProperty('templates')

            ;['otp', 'tfa'].forEach((templateType) => {
                expect(minimalResponse.templates[templateType].globalTemplates.templates).toHaveProperty('en')
                expect(Object.keys(minimalResponse.templates[templateType].globalTemplates.templates).length).toBe(1)
            })
        })
    })
})
