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
        jest.spyOn(smsTemplates, 'generateOtpTemplateFiles').mockImplementation(() => {})
        jest.spyOn(smsTemplates, 'generateTfaTemplateFiles').mockImplementation(() => {})
    })

    describe('Init test suite', () => {
        test('all sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: smsExpectedResponse })
            fs.existsSync.mockReturnValue(false)

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(smsTemplates.generateOtpTemplateFiles).toHaveBeenCalledTimes(1)
            expect(smsTemplates.generateTfaTemplateFiles).toHaveBeenCalledTimes(1)
        })

        test('minimum sms templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: getSmsExpectedResponseWithMinimumTemplates() })
            fs.existsSync.mockReturnValue(false)

            await smsTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            expect(smsTemplates.generateOtpTemplateFiles).toHaveBeenCalled()
            expect(smsTemplates.generateTfaTemplateFiles).toHaveBeenCalled()
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
})
