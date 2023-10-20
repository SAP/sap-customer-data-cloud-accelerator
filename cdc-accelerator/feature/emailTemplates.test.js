import { expectedGigyaResponseNok, getSiteConfig } from './test.gigyaResponses.js'
import { emailsExpectedResponse, emailTemplate, getEmailsExpectedResponseWithMinimumTemplates } from './test.gigyaResponses.emails.js'
import fs from 'fs'
import EmailTemplates from './emailTemplates.js'
import axios from 'axios'
import path from 'path'
import { credentials, siteDomain, apiKey, srcSiteDirectory } from './test.common.js'

jest.mock('axios')
jest.mock('fs')

describe('Email templates test suite', () => {
    const emailTemplates = new EmailTemplates(credentials)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Init test suite', () => {
        test('all email templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: emailsExpectedResponse })

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            await emailTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, emailTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            const numberOfTemplates = 13
            const numberOfLocales = 14
            expect(fs.writeFileSync.mock.calls.length).toBe(numberOfTemplates + numberOfLocales)
            const templateName = 'magicLink'
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, EmailTemplates.FOLDER_TEMPLATES, `${templateName}.html`), emailTemplate)
            expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(srcDirectory, EmailTemplates.FOLDER_LOCALES, templateName, 'en.json'), '{}')
        })

        test('minimum email templates files are generated successfully', async () => {
            axios.mockResolvedValueOnce({ data: getEmailsExpectedResponseWithMinimumTemplates() })

            fs.existsSync.mockReturnValue(false)
            fs.mkdirSync.mockReturnValue(undefined)
            fs.writeFileSync.mockReturnValue(undefined)

            await emailTemplates.init(apiKey, getSiteConfig, srcSiteDirectory)

            const srcDirectory = path.join(srcSiteDirectory, emailTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(srcDirectory)
            const numberOfTemplates = 10
            const numberOfLocales = 11
            expect(fs.writeFileSync.mock.calls.length).toBe(numberOfTemplates + numberOfLocales)
        })

        test('get email templates failed', async () => {
            axios.mockResolvedValueOnce({ data: expectedGigyaResponseNok })
            await expect(emailTemplates.init(apiKey, getSiteConfig, siteDomain)).rejects.toEqual(new Error(JSON.stringify(expectedGigyaResponseNok)))
        })

        test('feature directory already exists', async () => {
            axios.mockResolvedValueOnce({ data: emailsExpectedResponse })

            fs.existsSync.mockReturnValue(true)
            await expect(emailTemplates.init(apiKey, getSiteConfig, srcSiteDirectory, false)).rejects.toEqual(
                new Error(
                    `The "${path.join(
                        srcSiteDirectory,
                        emailTemplates.getName(),
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

            emailTemplates.reset(srcSiteDirectory)

            const featureDirectory = path.join(srcSiteDirectory, emailTemplates.getName())
            expect(fs.existsSync).toHaveBeenCalledWith(featureDirectory)
            if (dirExists) {
                expect(fs.rmSync).toHaveBeenCalledWith(featureDirectory, { force: true, recursive: true })
            } else {
                expect(fs.rmSync).not.toHaveBeenCalled()
            }
        }
    })
})
