import SmsConfiguration from '../sap-cdc-toolkit/copyConfig/sms/smsConfiguration.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from './siteFeature.js'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from './constants.js'
export default class SmsTemplates extends SiteFeature {
    static FOLDER_OTP = 'otp'
    static FOLDER_TFA = 'tfa'
    static FOLDER_GLOBAL_TEMPLATES = 'globalTemplates'
    static FOLDER_TEMPLATES_PER_COUNTRY_CODE = 'templatesPerCountryCode'

    constructor(credentials) {
        super(credentials)
    }

    getName() {
        return this.constructor.name
    }

    async init(apiKey, siteConfig, siteDirectory) {
        if (!siteConfig || typeof siteConfig.dataCenter === 'undefined') {
            throw new Error('Configuration error: siteConfig or siteConfig.dataCenter is undefined.')
        }

        const smsConfig = new SmsConfiguration(this.credentials, apiKey, siteConfig.dataCenter)
        const smsResponse = await smsConfig.get()
        if (smsResponse.errorCode) {
            throw new Error(JSON.stringify(smsResponse))
        }

        const featureDirectory = path.join(siteDirectory, this.getName())
        this.createDirectory(featureDirectory)

        this.generateOtpTemplateFiles(smsResponse, featureDirectory)
        this.generateTfaTemplateFiles(smsResponse, featureDirectory)
    }

    generateOtpTemplateFiles(smsResponse, featureDirectory) {
        const featureDirectoryOtp = path.join(featureDirectory, SmsTemplates.FOLDER_OTP)
        super.createDirectoryIfNotExists(featureDirectoryOtp)
        this.#generateTemplateFiles(smsResponse.templates.otp, featureDirectoryOtp)
    }

    generateTfaTemplateFiles(smsResponse, featureDirectory) {
        const featureDirectoryTfa = path.join(featureDirectory, SmsTemplates.FOLDER_TFA)
        super.createDirectoryIfNotExists(featureDirectoryTfa)
        this.#generateTemplateFiles(smsResponse.templates.tfa, featureDirectoryTfa)
    }

    #generateTemplateFiles(smsResponse, featureDirectory) {
        const globalTemplates = smsResponse.globalTemplates.templates
        const templatesPerCountryCode = smsResponse.templatesPerCountryCode
        const globalTemplatesDir = path.join(featureDirectory, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        super.createDirectoryIfNotExists(globalTemplatesDir)

        for (const [language, template] of Object.entries(globalTemplates)) {
            const filePath = path.join(globalTemplatesDir, `${language}.txt`)
            fs.writeFileSync(filePath, template)
        }

        const templatesPerCountryCodeDir = path.join(featureDirectory, SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE)
        super.createDirectoryIfNotExists(templatesPerCountryCodeDir)

        for (const [countryCode, countryTemplates] of Object.entries(templatesPerCountryCode)) {
            const countryDir = path.join(templatesPerCountryCodeDir, countryCode)
            super.createDirectoryIfNotExists(countryDir)

            for (const [language, template] of Object.entries(countryTemplates.templates)) {
                const filePath = path.join(countryDir, `${language}.txt`)
                fs.writeFileSync(filePath, template)
            }
        }
    }

    build(siteDirectory) {
        const srcFeaturePath = path.join(siteDirectory.replace(BUILD_DIRECTORY, SRC_DIRECTORY), this.getName())
        const srcOtpPath = path.join(srcFeaturePath, SmsTemplates.FOLDER_OTP, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        const srcTfaPath = path.join(srcFeaturePath, SmsTemplates.FOLDER_TFA, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        const buildFeaturePath = path.join(siteDirectory, this.getName())

        this.#buildTemplates(srcOtpPath, buildFeaturePath, SmsTemplates.FOLDER_OTP)
        this.#buildTemplates(srcTfaPath, buildFeaturePath, SmsTemplates.FOLDER_TFA)
    }

    #buildTemplates(srcTemplatesPath, buildFeaturePath, templateType) {
        fs.readdirSync(srcTemplatesPath).forEach((templateFile) => {
            const language = path.parse(templateFile).name
            const templateContent = fs.readFileSync(path.join(srcTemplatesPath, templateFile), { encoding: 'utf8' })

            const outputDirectory = path.join(buildFeaturePath, templateType)
            this.createDirectoryIfNotExists(outputDirectory)
            fs.writeFileSync(path.join(outputDirectory, `${language}.txt`), templateContent)
        })
    }
    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.getName()))
    }
}
