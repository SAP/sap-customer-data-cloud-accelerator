import SmsConfiguration from '../sap-cdc-toolkit/copyConfig/sms/smsConfiguration.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from './siteFeature.js'

export default class SmsTemplates extends SiteFeature {
    static FOLDER_OTP = 'SmsTemplates/otp'
    static FOLDER_TFA = 'SmsTemplates/tfa'
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

        const featureDirectoryOtp = path.join(siteDirectory, SmsTemplates.FOLDER_OTP)
        this.createDirectory(featureDirectoryOtp)
        const featureDirectoryTfa = path.join(siteDirectory, SmsTemplates.FOLDER_TFA)
        this.createDirectory(featureDirectoryTfa)

        const globalTemplatesDirOtp = path.join(featureDirectoryOtp, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        this.createDirectory(globalTemplatesDirOtp)
        const globalTemplatesDirTfa = path.join(featureDirectoryTfa, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        this.createDirectory(globalTemplatesDirTfa)

        this.#generateTemplateFiles(smsResponse.templates, featureDirectoryOtp, featureDirectoryTfa)
    }

    #generateTemplateFiles(smsResponse, featureDirectoryOtp, featureDirectoryTfa) {
        for (const type of ['otp', 'tfa']) {
            const typeResponse = smsResponse[type]
            const globalTemplates = typeResponse.globalTemplates.templates
            const templatesPerCountryCode = typeResponse.templatesPerCountryCode

            const targetDirectory = type === 'otp' ? featureDirectoryOtp : featureDirectoryTfa
            const globalTemplatesDir = path.join(targetDirectory, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)

            for (const [language, template] of Object.entries(globalTemplates)) {
                const filePath = path.join(globalTemplatesDir, `${language}.txt`)
                fs.writeFileSync(filePath, template)
            }

            const templatesPerCountryCodeDir = path.join(targetDirectory, SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE)
            this.createDirectoryIfNotExists(templatesPerCountryCodeDir)

            for (const [countryCode, countryTemplates] of Object.entries(templatesPerCountryCode)) {
                const countryDir = path.join(templatesPerCountryCodeDir, countryCode)
                this.createDirectoryIfNotExists(countryDir)

                for (const [language, template] of Object.entries(countryTemplates.templates)) {
                    const filePath = path.join(countryDir, `${language}.txt`)
                    fs.writeFileSync(filePath, template)
                }
            }
        }
    }

    createDirectoryIfNotExists(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }
    }

    reset(siteDirectory) {
        const directory = path.join(siteDirectory, this.getName())
        if (fs.existsSync(directory)) {
            fs.rmdirSync(directory, { recursive: true })
        }
    }
}
