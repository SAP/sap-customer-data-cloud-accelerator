/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitEmail from '../sap-cdc-toolkit/copyConfig/emails/emailConfiguration.js'
import ToolkitEmailOptions from '../sap-cdc-toolkit/copyConfig/emails/emailOptions.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from './siteFeature.js'

export default class EmailTemplates extends SiteFeature {
    static FOLDER_LOCALES = 'locales'
    static FOLDER_TEMPLATES = 'templates'
    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        const toolkitEmail = new ToolkitEmail(this.credentials, apiKey, siteConfig.dataCenter)
        const emailsResponse = await toolkitEmail.get()
        if (emailsResponse.errorCode) {
            throw new Error(JSON.stringify(emailsResponse))
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)
        const templatesDirectory = path.join(featureDirectory, EmailTemplates.FOLDER_TEMPLATES)
        this.clearDirectoryContents(templatesDirectory)
        const localesDirectory = path.join(featureDirectory, EmailTemplates.FOLDER_LOCALES)
        this.clearDirectoryContents(localesDirectory)

        this.#generateTemplateFiles(emailsResponse, templatesDirectory, localesDirectory)
    }

    #generateTemplateFiles(emailsResponse, templatesDirectory, localesDirectory) {
        let template = 'magicLink'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'codeVerification'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'emailVerification'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'welcomeEmailTemplates'
        if (emailsResponse.emailNotifications[template]) {
            fs.writeFileSync(
                path.join(templatesDirectory, `${template}.html`),
                emailsResponse.emailNotifications[template][emailsResponse.emailNotifications.welcomeEmailDefaultLanguage],
            )
            this.#generateLocaleFiles(template, emailsResponse.emailNotifications[template], localesDirectory)
        }
        template = 'accountDeletedEmailTemplates'
        if (emailsResponse.emailNotifications[template]) {
            fs.writeFileSync(
                path.join(templatesDirectory, `${template}.html`),
                emailsResponse.emailNotifications[template][emailsResponse.emailNotifications.accountDeletedEmailDefaultLanguage],
            )
            this.#generateLocaleFiles(template, emailsResponse.emailNotifications[template], localesDirectory)
        }
        template = 'confirmationEmailTemplates'
        if (emailsResponse.emailNotifications[template]) {
            fs.writeFileSync(
                path.join(templatesDirectory, `${template}.html`),
                emailsResponse.emailNotifications[template][emailsResponse.emailNotifications.confirmationEmailDefaultLanguage],
            )
            this.#generateLocaleFiles(template, emailsResponse.emailNotifications[template], localesDirectory)
        }
        template = 'preferencesCenter'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'doubleOptIn'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].confirmationEmailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].confirmationEmailTemplates, localesDirectory)
        }
        template = 'passwordReset'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'twoFactorAuth'
        if (emailsResponse[template]) {
            fs.writeFileSync(
                path.join(templatesDirectory, `${template}.html`),
                emailsResponse[template].emailProvider.emailTemplates[emailsResponse[template].emailProvider.defaultLanguage],
            )
            this.#generateLocaleFiles(template, emailsResponse[template].emailProvider.emailTemplates, localesDirectory)
        }
        template = 'impossibleTraveler'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'unknownLocationNotification'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
        template = 'passwordResetNotification'
        if (emailsResponse[template]) {
            fs.writeFileSync(path.join(templatesDirectory, `${template}.html`), emailsResponse[template].emailTemplates[emailsResponse[template].defaultLanguage])
            this.#generateLocaleFiles(template, emailsResponse[template].emailTemplates, localesDirectory)
        }
    }

    #generateLocaleFiles(templateName, emailTemplates, localesDirectory) {
        const templateDirectory = path.join(localesDirectory, templateName)
        this.createDirectoryIfNotExists(templateDirectory)
        for (const language of Object.keys(emailTemplates)) {
            fs.writeFileSync(path.join(templateDirectory, `${language}.json`), '{}')
        }
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }

    build(sitePath) {}

    async deploy(apiKey, siteConfig, siteDirectory) {
        const payload = {}
        const response = await this.deployUsingToolkit(apiKey, siteConfig, payload, new ToolkitEmailOptions())
        const isAnyError = response.some((res) => {
            return res.errorCode
        })
        if (isAnyError) {
            throw new Error(JSON.stringify(response))
        }
        return response
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitEmail = new ToolkitEmail(this.credentials, apiKey, siteConfig.dataCenter)
        return await toolkitEmail.copyEmailTemplates(apiKey, siteConfig, payload, options)
    }
}
