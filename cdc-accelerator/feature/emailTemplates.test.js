import { expectedGigyaResponseNok, getSiteConfig } from './test.gigyaResponses.js'
import { emailsExpectedResponse, emailTemplate, getEmailsExpectedResponseWithMinimumTemplates } from './test.gigyaResponses.emails.js'
import fs from 'fs'
import EmailTemplates from './emailTemplates.js'
import axios from 'axios'
import path from 'path'
import { credentials, siteDomain, apiKey, srcSiteDirectory, buildSiteDirectory } from './test.common.js'

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

    describe('Build test suite', () => {
        const magicLinkTemplate = emailTemplate
        const magicLinkLocaleEn = '{}'
        const passwordResetTemplate =
            '<html>' +
            '<head>' +
            '<meta name="subject" content="{{SUBJECT}}" />' +
            '</head>' +
            '<body>' +
            '{{GREETING}} <b>$firstName $lastName</b>,<br /><br />\n' +
            '{{PLEASE_CLICK_THE_LINK_TO_RESET_PASSWORD}} <br />\n' +
            '<a href="$pwResetLink">{{RESET_PASSWORD_LINK}}</a\n>' +
            '<br /><br />\n' +
            '{{THIS_LINK_WILL_BE_ACTIVE_FOR_24_HOURS}}\n' +
            '<br /><br />\n' +
            '{{{LINK_YOU_CAN_ACCESS_THE_PREFERENCES_CENTER_TO_UPDATE_YOUR_DETAILS}}}<br /><br />\n' +
            '{{BEST_REGARDS}},<br />\n' +
            '{{CUSTOMER}}' +
            '</body>' +
            '</html>'
        const passwordResetLocaleEn =
            '{\n' +
            '    "SUBJECT": "Password reset",\n' +
            '    "GREETING": "Hi",\n' +
            '    "PLEASE_CLICK_THE_LINK_TO_RESET_PASSWORD": "Please click the link to reset your password:",\n' +
            '    "RESET_PASSWORD_LINK": "Reset Password Link",\n' +
            '    "THIS_LINK_WILL_BE_ACTIVE_FOR_24_HOURS": "This link will be active for 24 hours.",\n' +
            '    "LINK_YOU_CAN_ACCESS_THE_PREFERENCES_CENTER_TO_UPDATE_YOUR_DETAILS": "At any time, <a href=\\"https://au-test.factory.com/en/preferences-center-1\\">Preference Center</a> to update your details.",\n' +
            '    "BEST_REGARDS": "Best regards",\n' +
            '    "CUSTOMER": "Customer1"\n' +
            '}\n'
        const passwordResetLocalePt =
            '{\n' +
            '    "SUBJECT": "Password reset",\n' +
            '    "GREETING": "Ola",\n' +
            '    "PLEASE_CLICK_THE_LINK_TO_RESET_PASSWORD": "Por favor carrega no link para fazer reset à tua password:",\n' +
            '    "RESET_PASSWORD_LINK": "Link para Reset Password",\n' +
            '    "THIS_LINK_WILL_BE_ACTIVE_FOR_24_HOURS": "Este link estará activo durante 24 horas.",\n' +
            '    "LINK_YOU_CAN_ACCESS_THE_PREFERENCES_CENTER_TO_UPDATE_YOUR_DETAILS": "Em qualquer altura, <a href=\\"https://au-test.factory.com/en/preferences-center-1\\">Preference Center</a> para actualizar os teus detalhes.",\n' +
            '    "BEST_REGARDS": "Cumprimentos",\n' +
            '    "CUSTOMER": "Cliente1"\n' +
            '}\n'
        const passwordResetRenderedEn =
            '<html>' +
            '<head>' +
            '<meta name="subject" content="Password reset" />' +
            '</head>' +
            '<body>' +
            'Hi <b>$firstName $lastName</b>,<br /><br />\n' +
            'Please click the link to reset your password: <br />\n' +
            '<a href="$pwResetLink">Reset Password Link</a\n>' +
            '<br /><br />\n' +
            'This link will be active for 24 hours.\n' +
            '<br /><br />\n' +
            'At any time, <a href="https://au-test.factory.com/en/preferences-center-1">Preference Center</a> to update your details.<br /><br />\n' +
            'Best regards,<br />\n' +
            'Customer1' +
            '</body>' +
            '</html>'
        const passwordResetRenderedPt =
            '<html>' +
            '<head>' +
            '<meta name="subject" content="Password reset" />' +
            '</head>' +
            '<body>' +
            'Ola <b>$firstName $lastName</b>,<br /><br />\n' +
            'Por favor carrega no link para fazer reset à tua password: <br />\n' +
            '<a href="$pwResetLink">Link para Reset Password</a\n>' +
            '<br /><br />\n' +
            'Este link estará activo durante 24 horas.\n' +
            '<br /><br />\n' +
            'Em qualquer altura, <a href="https://au-test.factory.com/en/preferences-center-1">Preference Center</a> para actualizar os teus detalhes.<br /><br />\n' +
            'Cumprimentos,<br />\n' +
            'Cliente1' +
            '</body>' +
            '</html>'
        test('two email templates generated successfully', async () => {
            const templateName1 = 'magicLink'
            const templateName2 = 'passwordReset'
            const templateFileExtension = '.html'
            fs.readdirSync
                .mockReturnValueOnce([`${templateName1}${templateFileExtension}`, `${templateName2}${templateFileExtension}`])
                .mockReturnValueOnce(['en.json'])
                .mockReturnValueOnce(['en.json', 'pt.json'])

            fs.existsSync.mockReturnValue(true)
            fs.readFileSync
                .mockReturnValueOnce(magicLinkTemplate)
                .mockReturnValueOnce(magicLinkLocaleEn)
                .mockReturnValueOnce(passwordResetTemplate)
                .mockReturnValueOnce(passwordResetLocaleEn)
                .mockReturnValueOnce(passwordResetLocalePt)

            await emailTemplates.build(buildSiteDirectory)
            expect(fs.writeFileSync.mock.calls.length).toBe(3)
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(
                1,
                path.join(buildSiteDirectory, emailTemplates.getName(), templateName1, `${templateName1}-en${templateFileExtension}`),
                emailTemplate,
            )
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(
                2,
                path.join(buildSiteDirectory, emailTemplates.getName(), templateName2, `${templateName2}-en${templateFileExtension}`),
                passwordResetRenderedEn,
            )
            expect(fs.writeFileSync).toHaveBeenNthCalledWith(
                3,
                path.join(buildSiteDirectory, emailTemplates.getName(), templateName2, `${templateName2}-pt${templateFileExtension}`),
                passwordResetRenderedPt,
            )
        })
    })
})
