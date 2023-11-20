import SmsConfiguration from '../sap-cdc-toolkit/copyConfig/sms/smsConfiguration.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from './siteFeature.js'
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

    reset(siteDirectory) {
        const directory = path.join(siteDirectory, this.getName())
        if (fs.existsSync(directory)) {
            fs.rmdirSync(directory, { recursive: true })
        }
    }
}
