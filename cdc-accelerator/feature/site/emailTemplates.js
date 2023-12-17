/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-accelerator contributors
 * License: Apache-2.0
 */
import ToolkitEmail from '../../sap-cdc-toolkit/copyConfig/emails/emailConfiguration.js'
import ToolkitEmailOptions from '../../sap-cdc-toolkit/copyConfig/emails/emailOptions.js'
import fs from 'fs'
import path from 'path'
import Mustache from 'mustache'
import SiteFeature from '../siteFeature.js'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from '../../core/constants.js'
import EmailTemplateNameTranslator from '../../sap-cdc-toolkit/emails/emailTemplateNameTranslator.js'

export default class EmailTemplates extends SiteFeature {
    static FOLDER_LOCALES = 'locales'
    static FOLDER_TEMPLATES = 'templates'
    static FILE_METADATA = 'metadata.json'
    constructor(credentials) {
        super(credentials)
    }

    getType() {
        return super.constructor.name
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

    build(siteDirectory) {
        const srcFeaturePath = path.join(siteDirectory, this.getName())
        const srcTemplatesPath = path.join(srcFeaturePath, EmailTemplates.FOLDER_TEMPLATES)
        const srcLocalesPath = path.join(srcFeaturePath, EmailTemplates.FOLDER_LOCALES)
        const buildFeaturePath = srcFeaturePath.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
        const previewEmailTemplatesMetadata = []

        fs.readdirSync(srcTemplatesPath).forEach((templateFile) => {
            const templateName = path.parse(templateFile).name
            const outputDirectory = path.join(buildFeaturePath, templateName)
            this.createDirectoryIfNotExists(outputDirectory)
            const htmlTemplate = fs.readFileSync(path.join(srcTemplatesPath, templateFile), { encoding: 'utf8' })
            const previewMetadataEntry = {
                emailID: templateName,
                languages: [],
            }
            previewEmailTemplatesMetadata[templateName] = { languages: [] }
            fs.readdirSync(path.join(srcLocalesPath, templateName)).forEach((localeFile) => {
                const localeData = fs.readFileSync(path.join(srcLocalesPath, templateName, localeFile), { encoding: 'utf8' })
                const renderedHtml = Mustache.render(htmlTemplate, JSON.parse(localeData.toString()))
                const language = path.parse(localeFile).name
                fs.writeFileSync(path.join(outputDirectory, `${templateName}-${language}${path.extname(templateFile)}`), renderedHtml)
                previewMetadataEntry.languages.push(language)
            })
            previewEmailTemplatesMetadata.push(previewMetadataEntry)
        })
        fs.writeFileSync(path.join(buildFeaturePath, EmailTemplates.FILE_METADATA), JSON.stringify(previewEmailTemplatesMetadata, null, 4))
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.getName())
        const payload = {}
        const emailOptions = new ToolkitEmailOptions()
        const emailNameTranslator = new EmailTemplateNameTranslator()
        fs.readdirSync(buildFeatureDirectory).forEach((templateName) => {
            if (!this.#emailTemplateShouldBeIgnored(templateName)) {
                const templatePayload = this.#generateEmailTemplatePayload(path.join(buildFeatureDirectory, templateName), templateName)
                this.#mergePayloads(payload, templatePayload)
                emailOptions.options.branches.push({
                    id: templateName,
                    name: emailNameTranslator.translateInternalName(templateName),
                    value: true,
                })
            }
        })

        const response = await this.deployUsingToolkit(apiKey, siteConfig, payload, emailOptions)
        const isAnyError = response.some((res) => {
            return res.errorCode !== 0
        })
        if (isAnyError) {
            throw new Error(JSON.stringify(response))
        }
        return response
    }

    #emailTemplateShouldBeIgnored(templateName) {
        return templateName === 'unknownLocationNotification' || templateName === 'passwordResetNotification' || templateName === EmailTemplates.FILE_METADATA
    }

    #generateEmailTemplatePayload(buildTemplateDirectory, templateName) {
        const jsonPath = this.#getEmailTemplateJsonPath(templateName)
        const payload = {}
        fs.readdirSync(buildTemplateDirectory).forEach((templateFile) => {
            const templateFilePath = path.join(buildTemplateDirectory, templateFile)
            const language = path.parse(templateFile.substring(templateName.length + 1)).name
            const content = fs.readFileSync(templateFilePath, { encoding: 'utf8' })
            const templateContainerObj = this.#getTemplateContainerObject(payload, jsonPath)
            templateContainerObj[language] = content
        })
        return payload
    }

    #getEmailTemplateJsonPath(templateName) {
        if (templateName.endsWith('EmailTemplates')) {
            return `emailNotifications.${templateName}`
        } else {
            if (templateName === 'doubleOptIn') {
                return `${templateName}.confirmationEmailTemplates`
            } else if (templateName === 'twoFactorAuth') {
                return `${templateName}.emailProvider.emailTemplates`
            }
            return `${templateName}.emailTemplates`
        }
    }

    #getTemplateContainerObject(payload, jsonPath) {
        const tokens = jsonPath.split('.')
        let pointer = payload
        for (const token of tokens) {
            if (pointer[token] === undefined) {
                pointer[token] = {}
            }
            pointer = pointer[token]
        }
        return pointer
    }

    #mergePayloads(payload, templatePayload) {
        const key = Object.keys(templatePayload)[0]
        if (payload[key]) {
            const subKey = Object.keys(templatePayload[key])[0]
            payload[key][subKey] = templatePayload[key][subKey]
        } else {
            payload[key] = templatePayload[key]
        }
    }

    async deployUsingToolkit(apiKey, siteConfig, payload, options) {
        const toolkitEmail = new ToolkitEmail(this.credentials, apiKey, siteConfig.dataCenter)
        return await toolkitEmail.copyEmailTemplates(apiKey, siteConfig, payload, options)
    }
}
