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
    const smsTemplates = new SmsTemplates(credentials)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        test('all sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: smsExpectedResponse })

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockImplementation((path, data) => {})

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, smsTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)

            const numberOfOtpTemplates = Object.keys(smsExpectedResponse.templates.otp.globalTemplates.templates).length
            const numberOfTfaTemplates = Object.keys(smsExpectedResponse.templates.tfa.globalTemplates.templates).length
            const totalNumberOfFiles = numberOfOtpTemplates + numberOfTfaTemplates

            expect(fs.writeFileSync.mock.calls.length).toBe(totalNumberOfFiles)
        })

        test('minimum sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: getSmsExpectedResponseWithMinimumTemplates() })

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, smsTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)

            const reducedSmsResponse = getSmsExpectedResponseWithMinimumTemplates()
            const numberOfOtpTemplates = Object.keys(reducedSmsResponse.templates.otp.globalTemplates.templates).length
            const numberOfTfaTemplates = Object.keys(reducedSmsResponse.templates.tfa.globalTemplates.templates).length
            const totalNumberOfFiles = numberOfOtpTemplates + numberOfTfaTemplates
            expect(fs.writeFileSync.mock.calls.length).toBe(totalNumberOfFiles)
        })

        test('get sms templates failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('feature directory already exists', async () => {
            axios.mockResolvedValueOnce({ data: smsExpectedResponse })
            fs.existsSync.mockReturnValue(true)

            await expect(smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        srcSiteDirectory,
                        smsTemplates.getName(),
                    )}" directory already exists, to overwrite its contents please use the option "reset" instead of "init"`,
                ),
            )
        })
    })
})
