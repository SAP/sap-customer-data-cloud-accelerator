/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */


import Sms from './sms.js'
import ZipManager from '../zip/zipManager.js'
import _ from 'lodash'
import generateErrorResponse, { ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_TEMPLATE_FILES } from '../errors/generateErrorResponse.js'

class SmsManager {
  static TEMPLATE_FILE_EXTENSION = '.txt'
  static TEMPLATE_DEFAULT_LANGUAGE_PLACEHOLDER = '.default'
  static TEMPLATE_TYPE_TFA = 'tfa'
  static TEMPLATE_TYPE_OTP = 'otp'
  static TEMPLATE_SUBTYPE_GLOBAL = 'globalTemplates'
  static TEMPLATE_SUBTYPE_COUNTRY = 'templatesPerCountryCode'
  static #zipIgnoreBaseFolders = ['__MACOSX']
  #zipManager

  constructor(credentials) {
    this.smsService = new Sms(credentials.userKey, credentials.secret)
    this.#zipManager = new ZipManager()
  }

  async export(site) {
    const smsTemplatesResponse = await this.smsService.getSiteSms(site)
    if (smsTemplatesResponse.errorCode === 0) {
      this.#exportTfaTemplates(smsTemplatesResponse)
      this.#exportOtpTemplates(smsTemplatesResponse)
      return this.#zipManager.createZipArchive()
    } else {
      return Promise.reject([smsTemplatesResponse])
    }
  }

  async import(site, zipContent) {
    let zipContentMap
    try {
      zipContentMap = await this.#zipManager.read(zipContent)
      this.zipBaseFolderInfo = this.#findZipBaseFolder(zipContentMap)
    } catch (error) {
      return Promise.reject([generateErrorResponse(error, 'Error importing SMS templates').data])
    }
    this.#cleanZipFile(zipContentMap)
    const smsTemplatesResponse = await this.#importTemplates(site, zipContentMap)
    return smsTemplatesResponse.errorCode === 0 ? smsTemplatesResponse : Promise.reject([smsTemplatesResponse])
  }

  #findZipBaseFolder(zipContentMap) {
    for (let entry of zipContentMap) {
      const filePath = entry[0]
      const templateFolderIndex = this.#getTemplateFolderIndex(filePath)
      if (templateFolderIndex !== -1 && !this.#isInIgnoreBaseFolders(filePath)) {
        if (templateFolderIndex === 0 || (templateFolderIndex > 0 && entry[0].charAt(templateFolderIndex - 1) === '/')) {
          const baseFolder = filePath.slice(0, templateFolderIndex)
          return {
            zipBaseFolder: baseFolder,
            numberOfFolders: (baseFolder.match(/\//g) || []).length,
          }
        }
      }
    }
    const error = {
      code: ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_TEMPLATE_FILES,
      details: `Zip file does not contains any SMS template files. Please export the templates again.`,
    }
    throw error
  }

  #getTemplateFolderIndex(filePath) {
    const folders = [
      `${SmsManager.TEMPLATE_TYPE_TFA}/${SmsManager.TEMPLATE_SUBTYPE_GLOBAL}/`,
      `${SmsManager.TEMPLATE_TYPE_TFA}/${SmsManager.TEMPLATE_SUBTYPE_COUNTRY}/`,
      `${SmsManager.TEMPLATE_TYPE_OTP}/${SmsManager.TEMPLATE_SUBTYPE_GLOBAL}/`,
      `${SmsManager.TEMPLATE_TYPE_OTP}/${SmsManager.TEMPLATE_SUBTYPE_COUNTRY}/`,
    ]
    let idx = -1
    for (const folder of folders) {
      idx = filePath.indexOf(folder)
      if (idx !== -1) {
        break
      }
    }
    return idx
  }

  #isInIgnoreBaseFolders(filePath) {
    return SmsManager.#zipIgnoreBaseFolders.some((folder) => filePath.startsWith(folder))
  }

  #cleanZipFile(zipContentMap) {
    for (const entry of zipContentMap) {
      if (!this.#isTemplateFile(entry[0])) {
        zipContentMap.delete(entry[0])
      }
    }
  }

  #isTemplateFile(file) {
    return (
      file.endsWith(SmsManager.TEMPLATE_FILE_EXTENSION) &&
      (file.startsWith(`${this.zipBaseFolderInfo.zipBaseFolder}${SmsManager.TEMPLATE_TYPE_TFA}`) ||
        file.startsWith(`${this.zipBaseFolderInfo.zipBaseFolder}${SmsManager.TEMPLATE_TYPE_OTP}`))
    )
  }

  async #importTemplates(site, zipContentMap) {
    const templates = this.#buildTemplatesFromZipContent(zipContentMap)
    return this.smsService.setSiteSms(site, templates)
  }

  #buildTemplatesFromZipContent(zipContentMap) {
    let template = {}
    for (let [filePath, newTemplate] of zipContentMap) {
      _.merge(template, this.#createTemplateObject(filePath, newTemplate))
    }
    return template
  }

  #createTemplateObject(zipEntry, newTemplate) {
    const template = {}
    let pointer = template
    const tokens = zipEntry.split('/')
    if (tokens.length > 2 + this.zipBaseFolderInfo.numberOfFolders) {
      let i
      for (i = this.zipBaseFolderInfo.numberOfFolders; i < tokens.length - 1; ++i) {
        pointer[tokens[i]] = {}
        pointer = pointer[tokens[i]]
      }
      pointer['templates'] = {}
      const languageIndex = tokens[i].lastIndexOf(SmsManager.TEMPLATE_FILE_EXTENSION)
      if (languageIndex !== -1) {
        let separatorIndex = languageIndex
        if (this.#isDefaultLanguage(tokens[i])) {
          separatorIndex = tokens[i].lastIndexOf(SmsManager.TEMPLATE_DEFAULT_LANGUAGE_PLACEHOLDER)
          pointer['defaultLanguage'] = tokens[i].slice(0, separatorIndex)
        }
        pointer = pointer.templates
        pointer[tokens[i].slice(0, separatorIndex)] = newTemplate
      }
    }
    return template
  }

  #isDefaultLanguage(filename) {
    return filename.includes(SmsManager.TEMPLATE_DEFAULT_LANGUAGE_PLACEHOLDER + SmsManager.TEMPLATE_FILE_EXTENSION)
  }

  #exportTfaTemplates(smsTemplatesResponse) {
    this.#exportTemplates(smsTemplatesResponse, SmsManager.TEMPLATE_TYPE_TFA)
  }

  #exportOtpTemplates(smsTemplatesResponse) {
    this.#exportTemplates(smsTemplatesResponse, SmsManager.TEMPLATE_TYPE_OTP)
  }

  #exportTemplates(smsTemplatesResponse, type) {
    this.#exportGlobalTemplates(smsTemplatesResponse, type)
    this.#exportTemplatesPerCountryCode(smsTemplatesResponse, type)
  }

  #exportGlobalTemplates(smsTemplatesResponse, type) {
    const folder = `${type}/${SmsManager.TEMPLATE_SUBTYPE_GLOBAL}`
    const globalTemplatesObj = smsTemplatesResponse.templates[type].globalTemplates.templates
    const globalTemplatesDefaultLanguage = smsTemplatesResponse.templates[type].globalTemplates.defaultLanguage
    for (const language in globalTemplatesObj) {
      const filename = globalTemplatesDefaultLanguage === language ? `${language}${SmsManager.TEMPLATE_DEFAULT_LANGUAGE_PLACEHOLDER}` : `${language}`
      this.#zipManager.createFile(folder, `${filename}${SmsManager.TEMPLATE_FILE_EXTENSION}`, globalTemplatesObj[language])
    }
    if (globalTemplatesObj === undefined || Object.keys(globalTemplatesObj).length === 0) {
      this.#zipManager.createFolder(folder)
    }
  }

  #exportTemplatesPerCountryCode(smsTemplatesResponse, type) {
    const folder = `${type}/${SmsManager.TEMPLATE_SUBTYPE_COUNTRY}`
    const templatesPerCountryCodeObj = smsTemplatesResponse.templates[type].templatesPerCountryCode
    for (const countryCode in templatesPerCountryCodeObj) {
      const countryCodeObj = templatesPerCountryCodeObj[countryCode].templates
      const templatesPerCountryCodeDefaultLanguage = templatesPerCountryCodeObj[countryCode].defaultLanguage
      for (const language in countryCodeObj) {
        const filename = templatesPerCountryCodeDefaultLanguage === language ? `${language}${SmsManager.TEMPLATE_DEFAULT_LANGUAGE_PLACEHOLDER}` : `${language}`
        this.#zipManager.createFile(`${folder}/${countryCode}`, `${filename}${SmsManager.TEMPLATE_FILE_EXTENSION}`, countryCodeObj[language])
      }
    }
    if (templatesPerCountryCodeObj === undefined || Object.keys(templatesPerCountryCodeObj).length === 0) {
      this.#zipManager.createFolder(folder)
    }
  }
}

export default SmsManager
