import SmsConfiguration from '../../sap-cdc-toolkit/copyConfig/sms/smsConfiguration.js'
import Sms from '../../sap-cdc-toolkit/sms/sms.js'
import fs from 'fs'
import path from 'path'
import SiteFeature from '../siteFeature.js'
import { BUILD_DIRECTORY, SRC_DIRECTORY } from '../../core/constants.js'

export default class SmsTemplates extends SiteFeature {
    static FOLDER_OTP = 'otp'
    static FOLDER_TFA = 'tfa'
    static FOLDER_GLOBAL_TEMPLATES = 'globalTemplates'
    static FOLDER_TEMPLATES_PER_COUNTRY_CODE = 'templatesPerCountryCode'

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
        const smsConfig = new SmsConfiguration(this.credentials, apiKey, siteConfig.dataCenter)
        const smsResponse = await smsConfig.get()
        if (smsResponse.errorCode) throw new Error(JSON.stringify(smsResponse))

        const featureDirectory = path.join(siteDirectory, this.constructor.name)
        this.createDirectory(featureDirectory)
        this.#processTemplates(smsResponse, featureDirectory, SmsTemplates.FOLDER_OTP)
        this.#processTemplates(smsResponse, featureDirectory, SmsTemplates.FOLDER_TFA)
    }

    #processTemplates(smsResponse, featureDirectory, templateType) {
        const featureDirectoryType = path.join(featureDirectory, templateType)
        this.createDirectoryIfNotExists(featureDirectoryType)
        this.#createAndWriteTemplates(smsResponse.templates[templateType].globalTemplates, featureDirectoryType)
        this.#createAndWriteCountryCodeTemplates(smsResponse.templates[templateType].templatesPerCountryCode, featureDirectoryType)
    }

    #createAndWriteTemplates(globalTemplates, featureDirectoryType) {
        const templatesDir = path.join(featureDirectoryType, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        this.createDirectoryIfNotExists(templatesDir)

        Object.entries(globalTemplates.templates).forEach(([language, template]) => {
            const filePath = path.join(templatesDir, `${language}${language === globalTemplates.defaultLanguage ? '.default' : ''}.txt`)
            fs.writeFileSync(filePath, template)
        })
    }

    #createAndWriteCountryCodeTemplates(templatesPerCountryCode, featureDirectoryType) {
        const countryCodeDir = path.join(featureDirectoryType, SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE)
        this.createDirectoryIfNotExists(countryCodeDir)

        Object.entries(templatesPerCountryCode).forEach(([countryCode, countryTemplates]) => {
            const countryDir = path.join(countryCodeDir, countryCode)
            this.createDirectoryIfNotExists(countryDir)

            Object.entries(countryTemplates.templates).forEach(([language, template]) => {
                const isDefaultLanguage = language === countryTemplates.defaultLanguage
                const fileName = isDefaultLanguage ? `${language}.default.txt` : `${language}.txt`
                const filePath = path.join(countryDir, fileName)
                fs.writeFileSync(filePath, template)
            })
        })
    }

    build(siteDirectory) {
        const buildFeaturePath = path.join(siteDirectory, this.getName()).replace(SRC_DIRECTORY, BUILD_DIRECTORY)
        this.clearDirectoryContents(buildFeaturePath)
        this.#buildTemplates(siteDirectory, SmsTemplates.FOLDER_OTP)
        this.#buildTemplates(siteDirectory, SmsTemplates.FOLDER_TFA)
    }

    #buildTemplates(siteDirectory, templateType) {
        const srcPath = path.join(siteDirectory, this.getName(), templateType)
        const buildFeaturePath = srcPath.replace(SRC_DIRECTORY, BUILD_DIRECTORY)
        this.#copyTemplateFiles(srcPath, buildFeaturePath)
    }

    #copyTemplateFiles(srcPath, buildFeaturePath) {
        this.createDirectoryIfNotExists(buildFeaturePath)

        fs.readdirSync(srcPath).forEach((fileOrFolder) => {
            const srcFilePath = path.join(srcPath, fileOrFolder)
            const outputFilePath = path.join(buildFeaturePath, fileOrFolder)
            if (fs.statSync(srcFilePath).isDirectory()) {
                this.#copyTemplateFiles(srcFilePath, outputFilePath)
            } else {
                fs.copyFileSync(srcFilePath, outputFilePath)
            }
        })
    }

    async deploy(apiKey, siteConfig, siteDirectory) {
        const buildFeatureDirectory = path.join(siteDirectory, this.constructor.name)
        const payload = this.#prepareSmsPayload(buildFeatureDirectory)
        const sms = new Sms(this.credentials.userKey, this.credentials.secret)

        const response = await sms.set(apiKey, siteConfig.dataCenter, payload)

        if (response.errorCode !== 0) {
            throw new Error(response.errorMessage || 'API error')
        }

        return response
    }

    #prepareSmsPayload(buildFeatureDirectory) {
        const payload = {
            otp: { globalTemplates: { templates: {}, defaultLanguage: null }, templatesPerCountryCode: {} },
            tfa: { globalTemplates: { templates: {}, defaultLanguage: null }, templatesPerCountryCode: {} },
        }

        this.#populateTemplatesFromDirectory(buildFeatureDirectory, payload, SmsTemplates.FOLDER_OTP)
        this.#populateTemplatesFromDirectory(buildFeatureDirectory, payload, SmsTemplates.FOLDER_TFA)
        return payload
    }

    #populateTemplatesFromDirectory(buildFeatureDirectory, payload, templateType) {
        const globalTemplatesDir = path.join(buildFeatureDirectory, templateType, SmsTemplates.FOLDER_GLOBAL_TEMPLATES)
        this.#populateGlobalTemplatesFromDirectory(globalTemplatesDir, payload[templateType].globalTemplates)

        const countryCodeDir = path.join(buildFeatureDirectory, templateType, SmsTemplates.FOLDER_TEMPLATES_PER_COUNTRY_CODE)
        this.#populateTemplatesPerCountryCode(countryCodeDir, payload[templateType].templatesPerCountryCode)
    }

    #populateGlobalTemplatesFromDirectory(directory, globalTemplatesObj) {
        if (!fs.existsSync(directory)) return

        let defaultFiles = []
        fs.readdirSync(directory).forEach((file) => {
            if (!file.endsWith('.txt')) return
            const fullPath = path.join(directory, file)
            const templateContent = fs.readFileSync(fullPath, 'utf8')
            let language = file.replace('.txt', '').replace('.default', '')
            if (file.endsWith('.default.txt')) {
                globalTemplatesObj.defaultLanguage = language
                defaultFiles.push(file)
            }
            globalTemplatesObj.templates[language] = templateContent
        })

        if (defaultFiles.length > 1) {
            throw new Error(`There cannot be two default files in the same folder. Check the folder: ${directory}`)
        }
    }

    #populateTemplatesPerCountryCode(countryCodeDir, targetObj) {
        if (!fs.existsSync(countryCodeDir)) return

        fs.readdirSync(countryCodeDir).forEach((countryCode) => {
            const countryDir = path.join(countryCodeDir, countryCode)
            if (!fs.statSync(countryDir).isDirectory()) return

            targetObj[countryCode] = { templates: {}, defaultLanguage: null }
            fs.readdirSync(countryDir).forEach((file) => {
                if (!file.endsWith('.txt')) return
                const fullPath = path.join(countryDir, file)
                const templateContent = fs.readFileSync(fullPath, 'utf8')
                let language = path.basename(file, '.txt').replace('.default', '')
                targetObj[countryCode].templates[language] = templateContent
                if (file.endsWith('.default.txt')) {
                    targetObj[countryCode].defaultLanguage = language
                }
            })
            if (!targetObj[countryCode].defaultLanguage) {
                throw new Error(`Default language not set for country code: ${countryCode}`)
            }
        })
    }

    reset(siteDirectory) {
        this.deleteDirectory(path.join(siteDirectory, this.constructor.name))
    }
}
